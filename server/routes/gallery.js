const router = require('express').Router();
const {
  listImages,
  listPublicImages,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/galleryController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages, tagUploadKind } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');
const { validateBody } = require('../middleware/validateRequest');
const { galleryImageSchema } = require('../schemas/contentSchemas');

router.get('/public', listPublicImages);
router.get('/', listImages);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  tagUploadKind('galerias'),
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
  tagUploadKind('galerias'),
  upload.single('image'),
  processUploadedImages,
  validateBody(galleryImageSchema.partial()),
  updateImage
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteImage);

module.exports = router;
