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

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), createEvent);
router.put('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('image'), updateEvent);
router.delete('/:id', authRequired, requireRole('ADMIN', 'EDITOR'), deleteEvent);

module.exports = router;
