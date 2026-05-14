const router = require('express').Router();
const {
  listImages,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/galleryController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listImages);
router.post('/', authRequired, upload.single('image'), createImage);
router.put('/:id', authRequired, upload.single('image'), updateImage);
router.delete('/:id', authRequired, deleteImage);

module.exports = router;
