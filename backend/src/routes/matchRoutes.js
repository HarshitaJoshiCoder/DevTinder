const express = require('express');
const requireAuth = require('../middleware/auth');
const { getMatches } = require('../controllers/matchController');

const router = express.Router();

router.use(requireAuth);
router.get('/', getMatches);

module.exports = router;
