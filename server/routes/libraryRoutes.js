const express = require('express');
const router = express.Router();
const { getAllDocuments, getDocument, readDocument, serveReadFile, checkAccess, purchaseDocument, verifyBookPayment, serveDocumentFile, downloadDocument, createDocument, updateDocument, deleteDocument, saveReadingProgress, getReadingProgress } = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { uploadDocumentMiddleware } = require('../middleware/uploadMiddleware');

router.get('/', getAllDocuments);
router.get('/:id', getDocument);
router.get('/:id/read', readDocument);
router.get('/:id/read-file', serveReadFile);
router.get('/:id/access', protect, checkAccess);
router.get('/:id/reading-progress', protect, getReadingProgress);
router.post('/:id/reading-progress', protect, saveReadingProgress);
router.post('/:id/purchase', protect, purchaseDocument);
router.post('/:id/verify-payment', protect, verifyBookPayment);
router.get('/:id/file', protect, serveDocumentFile);
router.get('/:id/download', protect, downloadDocument);
router.post('/', protect, admin, uploadDocumentMiddleware, createDocument);
router.put('/:id', protect, admin, uploadDocumentMiddleware, updateDocument);
router.delete('/:id', protect, admin, deleteDocument);

module.exports = router;
