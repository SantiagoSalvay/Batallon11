const router = require('express').Router();
const {
  listImages,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/galleryController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listImages);
router.post('/', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), createImage);
router.put('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), updateImage);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteImage);

module.exports = router;
