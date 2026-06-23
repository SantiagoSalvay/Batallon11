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
const { validateBody } = require('../middleware/validateRequest');
const { galleryImageSchema } = require('../schemas/contentSchemas');

router.get('/', listImages);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  validateBody(galleryImageSchema),
  createImage
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  validateBody(galleryImageSchema.partial()),
  updateImage
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteImage);

module.exports = router;
