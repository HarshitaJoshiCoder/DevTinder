const User = require('../models/User');

const EDITABLE_FIELDS = ['name', 'bio', 'role', 'skills', 'location', 'photoUrl'];

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.skills && !Array.isArray(updates.skills)) {
      return res.status(400).json({ message: 'skills must be an array of strings.' });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
