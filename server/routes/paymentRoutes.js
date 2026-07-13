const express = require('express');
const router = express.Router();
const { createPayment, confirmPayment, getPaymentHistory, getAllPayments, getSubscriptionStatus, cancelSubscription, requestBookPayment, checkBookPaymentStatus, handleDeliveryNotification } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', protect, createPayment);
router.put('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/subscription', protect, getSubscriptionStatus);
router.put('/subscription/cancel', protect, cancelSubscription);
router.get('/admin', protect, admin, getAllPayments);

router.post('/request', protect, requestBookPayment);
router.get('/status/:referenceId', protect, checkBookPaymentStatus);
router.post('/notification/:referenceId', protect, handleDeliveryNotification);

module.exports = router;
