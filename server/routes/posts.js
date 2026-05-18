const router = require('express').Router();
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listPosts);
router.get('/:id', getPost);

router.post('/', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), createPost);
router.put('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), updatePost);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deletePost);

module.exports = router;
