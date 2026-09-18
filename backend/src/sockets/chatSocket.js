const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { assertMembership } = require('../controllers/messageController');

/**
 * Wires up the real-time layer on top of an existing Socket.io server.
 *
 * Rooms used:
 *   user:<userId>   - every authenticated socket joins its own personal room,
 *                      so we can push "new_match" notifications without the
 *                      client needing to already be inside a chat screen.
 *   match:<matchId> - joined explicitly once a user opens a conversation;
 *                      chat messages are broadcast to this room only.
 */
function attachSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join_match', async (matchId, ack) => {
      const match = await assertMembership(matchId, socket.userId);
      if (!match) {
        return ack?.({ ok: false, error: 'Not a participant in this match.' });
      }
      socket.join(`match:${matchId}`);
      ack?.({ ok: true });
    });

    socket.on('send_message', async ({ matchId, content }, ack) => {
      try {
        if (!content || !content.trim()) {
          return ack?.({ ok: false, error: 'Message cannot be empty.' });
        }

        const match = await assertMembership(matchId, socket.userId);
        if (!match) {
          return ack?.({ ok: false, error: 'Not a participant in this match.' });
        }

        const message = await Message.create({
          match: matchId,
          sender: socket.userId,
          content: content.trim(),
        });

        match.lastMessageAt = message.createdAt;
        await match.save();

        io.to(`match:${matchId}`).emit('receive_message', message);
        ack?.({ ok: true, message });
      } catch (err) {
        ack?.({ ok: false, error: 'Failed to send message.' });
      }
    });

    socket.on('typing', ({ matchId, isTyping }) => {
      socket.to(`match:${matchId}`).emit('peer_typing', { userId: socket.userId, isTyping });
    });
  });

  // Called from swipeController when a mutual like creates a match, so both
  // participants get an instant "It's a match!" event if they're online.
  io.notifyNewMatch = (userIds, matchData) => {
    userIds.forEach((uid) => io.to(`user:${uid}`).emit('new_match', matchData));
  };
}

module.exports = attachSocket;
