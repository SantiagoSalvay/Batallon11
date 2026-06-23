const router = require('express').Router();
const {
  listImagesByStageSlug,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/stageGalleryController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');
const { validateBody } = require('../middleware/validateRequest');
const { stageGalleryImageSchema } = require('../schemas/contentSchemas');

router.get('/', listImagesByStageSlug);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  requireStageScope,
  validateBody(stageGalleryImageSchema),
  createImage
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  requireStageScope,
  validateBody(stageGalleryImageSchema.partial()),
  updateImage
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteImage
);

module.exports = router;
