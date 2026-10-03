const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../utils/mailer');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// Frontend uses Google Identity Services to obtain an ID token, then posts it
// here. We verify it server-side rather than trusting anything the client sends.
async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required.' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google sign-in is not configured on this server.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token.' });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        photoUrl: payload.picture || '',
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const token = generateToken(user._id);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    // Always respond with the same generic message, whether or not the
    // account exists, so this endpoint can't be used to enumerate emails.
    const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      // Either no account, or a Google-only account with no password to reset.
      return res.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    await sendMail({
      to: user.email,
      subject: 'Reset your DevTinder password',
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      html: `<p>Someone requested a password reset for this account.</p><p><a href="${resetUrl}">Click here to reset your password</a> (expires in 1 hour).</p><p>If you didn't request this, you can ignore this email.</p>`,
    });

    return res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: 'email, token, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordTokenHash: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'That reset link is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);
    return res.json({ token: authToken, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };
