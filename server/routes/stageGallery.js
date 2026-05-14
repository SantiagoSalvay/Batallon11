const router = require('express').Router();
const {
  listImagesByStageId,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/stageGalleryController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listImagesByStageId);
router.post('/', authRequired, upload.single('image'), createImage);
router.put('/:id', authRequired, upload.single('image'), updateImage);
router.delete('/:id', authRequired, deleteImage);

module.exports = router;
