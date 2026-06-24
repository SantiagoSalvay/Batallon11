const router = require('express').Router();
const {
  listStages,
  getStageBySlug,
} = require('../controllers/stageController');
const { listarPublicacionesDeEtapa } = require('../controllers/publicacionController');
const { listImagesBySlug } = require('../controllers/stageGalleryController');

router.get('/', listStages);
router.get('/:slug', getStageBySlug);
router.get('/:slug/publicaciones', listarPublicacionesDeEtapa);
router.get('/:slug/gallery', listImagesBySlug);

module.exports = router;
