const router = require('express').Router();
const {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { processUploadedImages } = require('../middleware/processImage');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  createEvent
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  upload.single('image'),
  processUploadedImages,
  updateEvent
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteEvent);

module.exports = router;
