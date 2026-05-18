const router = require('express').Router();
const {
  listStagePostsByStageId,
  createStagePost,
  updateStagePost,
  deleteStagePost,
} = require('../controllers/stagePostController');
const { authRequired, requireRole, requireStageScope } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listStagePostsByStageId);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  requireStageScope,
  createStagePost,
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.single('image'),
  updateStagePost,
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  deleteStagePost,
);

module.exports = router;
