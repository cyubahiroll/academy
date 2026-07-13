const multer = require('multer');
const path = require('path');

const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads', destination));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const allAllowed = [...allowedTypes.image, ...allowedTypes.video, ...allowedTypes.document];
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
  }
};

const uploadVideo = multer({
  storage: createStorage('videos'),
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

const uploadDocument = multer({
  storage: createStorage('documents'),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadProfile = multer({
  storage: createStorage('profile'),
  fileFilter: (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCertificate = multer({
  storage: createStorage('certificates'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for certificates.'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { uploadVideo, uploadDocument, uploadProfile, uploadCertificate };
