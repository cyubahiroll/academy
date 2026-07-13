const express = require('express');
const router = express.Router();
const { getAllVideos, getVideo, createVideo, updateVideo, deleteVideo, streamVideo } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { uploadVideoMiddleware } = require('../middleware/uploadMiddleware');

router.get('/', getAllVideos);
router.get('/:id/stream', streamVideo);
router.get('/:id', getVideo);
router.post('/', protect, admin, uploadVideoMiddleware, createVideo);
router.put('/:id', protect, admin, uploadVideoMiddleware, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

module.exports = router;
