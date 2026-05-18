const router = require('express').Router();
const {
  listImagesByStageId,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/stageGalleryController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', listImagesByStageId);
router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  processUploadedImages,
  requireStageScope,
  createImage
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  processUploadedImages,
  updateImage
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteImage
);

module.exports = router;
