const express = require('express');
const router = express.Router();
const { getAllQuizzes, getQuiz, startQuiz, submitQuiz, createQuiz, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getAllQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/start', protect, startQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.post('/', protect, admin, createQuiz);
router.put('/:id', protect, admin, updateQuiz);
router.delete('/:id', protect, admin, deleteQuiz);

module.exports = router;
