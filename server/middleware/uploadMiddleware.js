const { uploadVideo, uploadDocument, uploadProfile, uploadCertificate } = require('../config/multer');

const handleUpload = (upload) => {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large' });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

const uploadVideoMiddleware = handleUpload(uploadVideo.single('video'));
const uploadDocumentMiddleware = handleUpload(uploadDocument.single('document'));
const uploadProfileMiddleware = handleUpload(uploadProfile.single('avatar'));
const uploadCertificateMiddleware = handleUpload(uploadCertificate.single('certificate'));

const handleMultipleUploads = (upload) => {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'One or more files are too large' });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

const uploadMultipleVideos = handleMultipleUploads(uploadVideo.array('videos', 5));
const uploadMultipleDocuments = handleMultipleUploads(uploadDocument.array('documents', 5));

module.exports = {
  uploadVideoMiddleware, uploadDocumentMiddleware,
  uploadProfileMiddleware, uploadCertificateMiddleware,
  uploadMultipleVideos, uploadMultipleDocuments
};
