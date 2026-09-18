const Match = require('../models/Match');

async function getMatches(req, res, next) {
  try {
    const matches = await Match.find({ users: req.userId })
      .sort({ lastMessageAt: -1 })
      .populate('users', '-passwordHash');

    // Trim each match down to "the other person" so the frontend doesn't
    // have to filter req.userId out of the pair itself.
    const shaped = matches.map((m) => ({
      _id: m._id,
      otherUser: m.users.find((u) => u._id.toString() !== req.userId),
      lastMessageAt: m.lastMessageAt,
      createdAt: m.createdAt,
    }));

    return res.json({ matches: shaped });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMatches };
