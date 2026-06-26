const router = require('express').Router();
const {
  listStagePostsByStageSlug,
  createStagePost,
  updateStagePost,
  deleteStagePost,
} = require('../controllers/stagePostController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { attachUserOptional } = require('../middleware/attachUserOptional');
const { upload } = require('../middleware/upload');
const { processUploadedImages, tagUploadKind } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');
const { validateBody } = require('../middleware/validateRequest');
const {
  stagePostBodySchema,
  stagePostBodyUpdateSchema,
} = require('../schemas/contentSchemas');

router.get('/', attachUserOptional, listStagePostsByStageSlug);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  uploadLimiter,
  tagUploadKind('publicaciones', { groupByPublication: true }),
  upload.fields([{ name: 'images', maxCount: 6 }, { name: 'image', maxCount: 1 }]),
  processUploadedImages,
  requireStageScope,
  validateBody(stagePostBodySchema),
  createStagePost
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  uploadLimiter,
  tagUploadKind('publicaciones', { groupByPublication: true }),
  upload.fields([{ name: 'images', maxCount: 6 }, { name: 'image', maxCount: 1 }]),
  processUploadedImages,
  requireStageScope,
  validateBody(stagePostBodyUpdateSchema),
  updateStagePost
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteStagePost
);

module.exports = router;
