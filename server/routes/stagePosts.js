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
const { MAX_POST_IMAGES } = require('../utils/publicacionApi');

router.get('/', attachUserOptional, listStagePostsByStageSlug);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  uploadLimiter,
  tagUploadKind('publicaciones', { mirrorToGallery: true }),
  upload.array('image', MAX_POST_IMAGES),
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
  tagUploadKind('publicaciones', { mirrorToGallery: true }),
  upload.array('image', MAX_POST_IMAGES),
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
