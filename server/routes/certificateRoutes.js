const express = require('express');
const router = express.Router();
const { getMyCertificates, getAllCertificates, issueCertificate, verifyCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/my', protect, getMyCertificates);
router.get('/admin', protect, admin, getAllCertificates);
router.post('/issue', protect, admin, issueCertificate);
router.get('/verify/:number', verifyCertificate);
router.delete('/:id', protect, admin, deleteCertificate);

module.exports = router;
