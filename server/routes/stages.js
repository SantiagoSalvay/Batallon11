const router = require('express').Router();
const {
  listStages,
  getStageBySlug,
} = require('../controllers/stageController');
const { listStagePostsBySlug } = require('../controllers/stagePostController');
const { listImagesBySlug } = require('../controllers/stageGalleryController');

router.get('/', listStages);
router.get('/:slug', getStageBySlug);
router.get('/:slug/posts', listStagePostsBySlug);
router.get('/:slug/gallery', listImagesBySlug);

module.exports = router;
