const express = require('express');
const requireAuth = require('../middleware/auth');
const { getFeed, swipe } = require('../controllers/swipeController');

const router = express.Router();

router.use(requireAuth);
router.get('/feed', getFeed);
router.post('/:targetUserId', swipe);

module.exports = router;
