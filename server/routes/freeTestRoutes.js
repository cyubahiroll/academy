const express = require('express');
const router = express.Router();
const { startTest, submitTest, getHistory } = require('../controllers/freeTestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startTest);
router.post('/submit', protect, submitTest);
router.get('/history', protect, getHistory);

module.exports = router;
