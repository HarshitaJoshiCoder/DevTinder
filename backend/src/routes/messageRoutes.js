const express = require('express');
const requireAuth = require('../middleware/auth');
const { getHistory } = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);
router.get('/:matchId', getHistory);

module.exports = router;
