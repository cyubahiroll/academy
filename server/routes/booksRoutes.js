const express = require('express');
const router = express.Router();
const { readDocument, downloadDocument } = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id/read', readDocument);
router.get('/:id/download', protect, downloadDocument);

module.exports = router;
