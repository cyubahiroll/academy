const express = require('express');
const router = express.Router();
const { ask, history } = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, ask);
router.get('/history', protect, history);

module.exports = router;
