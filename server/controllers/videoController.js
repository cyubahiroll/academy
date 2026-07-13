const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

const VIDEO_DIR = path.join(__dirname, '..', 'uploads', 'videos');

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska'
};

exports.streamVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || !video.video_url) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const filename = path.basename(video.video_url);
    const filePath = path.join(VIDEO_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'video/mp4';

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', (err) => {
        console.error('[Video] Stream error:', err.message);
        if (!res.headersSent) res.status(500).end();
      });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      stream.pipe(res);
    } else {
      const stream = fs.createReadStream(filePath);
      stream.on('error', (err) => {
        console.error('[Video] Stream error:', err.message);
        if (!res.headersSent) res.status(500).end();
      });

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });
      stream.pipe(res);
    }
  } catch (error) {
    next(error);
  }
};

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
