const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, toggleUserStatus, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUser);
router.put('/:id/toggle-status', protect, admin, toggleUserStatus);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
