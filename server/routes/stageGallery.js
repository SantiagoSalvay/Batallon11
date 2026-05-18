const router = require('express').Router();
const {
  listImagesByStageId,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/stageGalleryController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listImagesByStageId);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  requireStageScope,
  createImage,
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  updateImage,
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteImage,
);

module.exports = router;
