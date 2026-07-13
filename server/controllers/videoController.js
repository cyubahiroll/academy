const Video = require('../models/Video');

exports.getAllVideos = async (req, res, next) => {
  try {
    const isFree = req.query.is_free !== undefined ? req.query.is_free === 'true' : null;
    const videos = await Video.findAll(isFree);
    res.json(videos);
  } catch (error) {
    next(error);
  }
};

exports.getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    await Video.incrementViews(req.params.id);
    res.json(video);
  } catch (error) {
    next(error);
  }
};

exports.createVideo = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      video_url: req.file ? '/uploads/videos/' + req.file.filename : req.body.video_url,
      thumbnail: req.body.thumbnail,
      duration: req.body.duration,
      category_id: req.body.category_id || null,
      is_free: req.body.is_free === 'true' || req.body.is_free === true
    };
    const id = await Video.create(data);
    const video = await Video.findById(id);
    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.video_url = '/uploads/videos/' + req.file.filename;
    }
    const affected = await Video.update(req.params.id, data);
    if (affected === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    const video = await Video.findById(req.params.id);
    res.json(video);
  } catch (error) {
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const affected = await Video.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};
