const router = require('express').Router();
const {
  listStagePostsByStageId,
  createStagePost,
  updateStagePost,
  deleteStagePost,
} = require('../controllers/stagePostController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { attachUserOptional } = require('../middleware/attachUserOptional');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', attachUserOptional, listStagePostsByStageId);
router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  processUploadedImages,
  requireStageScope,
  createStagePost
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  processUploadedImages,
  updateStagePost
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteStagePost
);

module.exports = router;
