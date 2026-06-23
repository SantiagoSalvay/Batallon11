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
const { validateBody } = require('../middleware/validateRequest');
const { eventBodySchema, eventBodyUpdateSchema } = require('../schemas/contentSchemas');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post(
  '/',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  validateBody(eventBodySchema),
  createEvent
);
router.put(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR'),
  uploadLimiter,
  upload.single('image'),
  processUploadedImages,
  validateBody(eventBodyUpdateSchema),
  updateEvent
);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteEvent);

module.exports = router;
