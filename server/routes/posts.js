const router = require('express').Router();
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listPosts);
router.get('/:id', getPost);

router.post('/', authRequired, upload.single('image'), createPost);
router.put('/:id', authRequired, upload.single('image'), updatePost);
router.delete('/:id', authRequired, deletePost);

module.exports = router;
