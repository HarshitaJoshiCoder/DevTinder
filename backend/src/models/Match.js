const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    // Always stored sorted by ObjectId string so a (userA, userB) pair can
    // never create two different match documents regardless of who liked whom last.
    users: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: (v) => Array.isArray(v) && v.length === 2,
      required: true,
    },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

matchSchema.index({ users: 1 });

module.exports = mongoose.model('Match', matchSchema);
