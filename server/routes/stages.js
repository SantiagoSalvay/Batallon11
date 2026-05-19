const router = require('express').Router();
const {
  listStages,
  getStageBySlug,
  updateStageMedia,
} = require('../controllers/stageController');
const { listStagePostsBySlug } = require('../controllers/stagePostController');
const { listImagesBySlug } = require('../controllers/stageGalleryController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

const stageImageFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

router.get('/', listStages);
router.get('/:slug', getStageBySlug);
router.get('/:slug/posts', listStagePostsBySlug);
router.get('/:slug/gallery', listImagesBySlug);

router.put(
  '/:slug/media',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  stageImageFields,
  processUploadedImages,
  updateStageMedia,
);

module.exports = router;
