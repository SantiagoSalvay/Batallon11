const router = require('express').Router();
const { getHero, updateHero } = require('../controllers/heroController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', getHero);
router.put(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('heroImage'),
  processUploadedImages,
  updateHero
);

module.exports = router;
