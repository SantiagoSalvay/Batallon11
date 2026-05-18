const router = require('express').Router();
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authRequired, requireRole } = require('../middleware/auth');
const { attachUserOptional } = require('../middleware/attachUserOptional');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', listPosts);
router.get('/:id', attachUserOptional, getPost);

router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  createPost
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  updatePost
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deletePost);

module.exports = router;
