const express = require('express');
const router = express.Router();
const { listDocuments, generate, preview, save } = require('../controllers/aiQuestionController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/documents', protect, admin, listDocuments);
router.post('/generate', protect, admin, generate);
router.post('/preview', protect, admin, preview);
router.post('/save', protect, admin, save);

module.exports = router;
