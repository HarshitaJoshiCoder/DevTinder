const Match = require('../models/Match');
const Message = require('../models/Message');

async function assertMembership(matchId, userId) {
  const match = await Match.findById(matchId);
  if (!match) return null;
  const belongs = match.users.some((u) => u.toString() === userId);
  return belongs ? match : null;
}

async function getHistory(req, res, next) {
  try {
    const { matchId } = req.params;
    const match = await assertMembership(matchId, req.userId);
    if (!match) {
      return res.status(403).json({ message: "You don't have access to this conversation." });
    }

    const messages = await Message.find({ match: matchId }).sort({ createdAt: 1 }).limit(200);
    return res.json({ messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, assertMembership };
