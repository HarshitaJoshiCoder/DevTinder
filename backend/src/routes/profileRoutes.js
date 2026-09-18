const express = require('express');
const requireAuth = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/profileController');

const router = express.Router();

router.use(requireAuth);
router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
