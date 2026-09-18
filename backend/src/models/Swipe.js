const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
  },
  { timestamps: true }
);

// A user can only swipe on any given profile once - re-swiping updates the action.
swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
