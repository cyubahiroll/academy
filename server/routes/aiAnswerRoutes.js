const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { solveQuestion, answerQuestions } = require('../controllers/aiAnswerController');

router.post('/solve', protect, solveQuestion);
router.post('/answer', protect, answerQuestions);

module.exports = router;
