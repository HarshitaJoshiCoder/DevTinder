const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, googleLogin } = require('../controllers/authController');

const router = express.Router();

// A slightly stricter limiter on auth endpoints since they're the most
// common target for credential-stuffing / brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

module.exports = router;
