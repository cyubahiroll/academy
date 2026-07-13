const express = require('express');
const router = express.Router();
const { getQuizResults, getExamResults } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

router.get('/quiz-results', protect, getQuizResults);
router.get('/exam-results', protect, getExamResults);

module.exports = router;
