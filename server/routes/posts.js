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
const { processUploadedImages, tagUploadKind } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');
const { validateBody } = require('../middleware/validateRequest');
const { postBodySchema, postBodyUpdateSchema } = require('../schemas/contentSchemas');

router.get('/', listPosts);
router.get('/:id', attachUserOptional, getPost);

router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  tagUploadKind('publicaciones', { groupByPublication: true }),
  upload.fields([{ name: 'images', maxCount: 6 }, { name: 'image', maxCount: 1 }]),
  processUploadedImages,
  validateBody(postBodySchema),
  createPost
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  tagUploadKind('publicaciones', { groupByPublication: true }),
  upload.fields([{ name: 'images', maxCount: 6 }, { name: 'image', maxCount: 1 }]),
  processUploadedImages,
  validateBody(postBodyUpdateSchema),
  updatePost
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deletePost);

module.exports = router;
