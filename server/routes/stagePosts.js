const router = require('express').Router();
const {
  listStagePostsByStageId,
  createStagePost,
  updateStagePost,
  deleteStagePost,
} = require('../controllers/stagePostController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listStagePostsByStageId);
router.post('/', authRequired, upload.single('image'), createStagePost);
router.put('/:id', authRequired, upload.single('image'), updateStagePost);
router.delete('/:id', authRequired, deleteStagePost);

module.exports = router;
