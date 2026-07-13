const express = require('express');
const router = express.Router();
const { getAllExams, getExam, startExam, submitExam, createExam } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getAllExams);
router.get('/:id', getExam);
router.post('/:id/start', protect, startExam);
router.post('/:id/submit', protect, submitExam);
router.post('/', protect, admin, createExam);

module.exports = router;
