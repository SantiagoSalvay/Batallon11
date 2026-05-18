const router = require('express').Router();
const {
  listImages,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/galleryController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', listImages);
router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  createImage
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  updateImage
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteImage);

module.exports = router;
