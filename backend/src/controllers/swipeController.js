const mongoose = require('mongoose');
const User = require('../models/User');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

const FEED_CACHE_TTL_SECONDS = 300; // 5 minutes
const FEED_LIMIT = 20;

function feedCacheKey(userId) {
  return `feed:${userId}`;
}

// Sorted pair so (A,B) and (B,A) always map to the same match lookup key.
function sortedPair(a, b) {
  return [a.toString(), b.toString()].sort();
}

async function getFeed(req, res, next) {
  try {
    const cached = await cacheGet(feedCacheKey(req.userId));
    if (cached) {
      return res.json({ profiles: cached, source: 'cache' });
    }

    const swiped = await Swipe.find({ fromUser: req.userId }).select('toUser');
    const excludeIds = swiped.map((s) => s.toUser).concat([new mongoose.Types.ObjectId(req.userId)]);

    const me = await User.findById(req.userId).select('skills');
    const mySkills = me?.skills || [];

    // Prefer candidates who share at least one skill, then fill the rest of
    // the deck with everyone else so the feed never comes back empty.
    const preferred = await User.find({
      _id: { $nin: excludeIds },
      ...(mySkills.length ? { skills: { $in: mySkills } } : {}),
    })
      .limit(FEED_LIMIT)
      .select('-passwordHash');

    let profiles = preferred;
    if (profiles.length < FEED_LIMIT) {
      const remaining = FEED_LIMIT - profiles.length;
      const already = excludeIds.concat(profiles.map((p) => p._id));
      const rest = await User.find({ _id: { $nin: already } })
        .limit(remaining)
        .select('-passwordHash');
      profiles = profiles.concat(rest);
    }

    await cacheSet(feedCacheKey(req.userId), profiles, FEED_CACHE_TTL_SECONDS);
    return res.json({ profiles, source: 'db' });
  } catch (err) {
    next(err);
  }
}

async function swipe(req, res, next) {
  try {
    const { targetUserId } = req.params;
    const { action } = req.body;

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({ message: "action must be 'like' or 'pass'." });
    }
    if (targetUserId === req.userId) {
      return res.status(400).json({ message: 'You cannot swipe on yourself.' });
    }

    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: 'That profile no longer exists.' });

    await Swipe.findOneAndUpdate(
      { fromUser: req.userId, toUser: targetUserId },
      { action },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Invalidate the swiper's cached feed since this candidate should no
    // longer appear in it.
    await cacheDel(feedCacheKey(req.userId));

    if (action === 'pass') {
      return res.json({ match: false });
    }

    const reciprocal = await Swipe.findOne({
      fromUser: targetUserId,
      toUser: req.userId,
      action: 'like',
    });

    if (!reciprocal) {
      return res.json({ match: false });
    }

    const pair = sortedPair(req.userId, targetUserId);
    let match = await Match.findOne({ users: { $all: pair, $size: 2 } });
    if (!match) {
      match = await Match.create({ users: pair });
    }

    const populated = await match.populate('users', '-passwordHash');

    // Let the real-time layer know so both users get an instant notification
    // if they're online, without the REST response needing to wait on it.
    req.app.get('io')?.notifyNewMatch(pair, populated);

    return res.json({ match: true, matchData: populated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeed, swipe };
