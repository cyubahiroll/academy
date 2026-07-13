const express = require('express');
const router = express.Router();
const { readDocument, downloadDocument } = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:bookId/read', readDocument);
router.get('/:bookId/download', protect, downloadDocument);

module.exports = router;
