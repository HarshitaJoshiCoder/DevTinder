const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Present only for email/password accounts. Absent for Google-only accounts.
    passwordHash: { type: String, select: false },

    // Present only for accounts created/linked via Google Sign-In.
    googleId: { type: String, unique: true, sparse: true },

    photoUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    role: { type: String, default: '', maxlength: 60 }, // e.g. "Frontend Engineer"
    skills: { type: [String], default: [] },
    location: { type: String, default: '' },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ skills: 1 });

// Never leak the password hash even if a caller forgets .select('-passwordHash')
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
