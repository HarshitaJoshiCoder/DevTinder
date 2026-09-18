const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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

module.exports = { register, login, googleLogin };
