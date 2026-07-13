const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserRank } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaderboard);
router.get('/my-rank', protect, getUserRank);

module.exports = router;
