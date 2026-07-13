const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, updateEmail, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileMiddleware } = require('../middleware/uploadMiddleware');

router.post('/register', [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 5, max: 12 }).withMessage('Password must be between 5 and 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[!@#$%^&*()_+\-=\?<>,.]/).withMessage('Password must contain a special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfileMiddleware, updateProfile);
router.put('/email', protect, [
  body('newEmail').isEmail().withMessage('Please provide a valid email address'),
  body('newEmail').trim().notEmpty().withMessage('New email is required'),
  body('currentPassword').notEmpty().withMessage('Current password is required'),
], updateEmail);
router.put('/change-password', protect, changePassword);

module.exports = router;
