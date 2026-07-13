const express = require('express');
const router = express.Router();
const {
  getAll, getById, create, update, delete: deleteMember
} = require('../controllers/teamMemberController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { uploadProfileMiddleware } = require('../middleware/uploadMiddleware');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', protect, admin, uploadProfileMiddleware, create);
router.put('/:id', protect, admin, uploadProfileMiddleware, update);
router.delete('/:id', protect, admin, deleteMember);

module.exports = router;
