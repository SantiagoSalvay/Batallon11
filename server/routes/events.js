const router = require('express').Router();
const {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authRequired, upload.single('image'), createEvent);
router.put('/:id', authRequired, upload.single('image'), updateEvent);
router.delete('/:id', authRequired, deleteEvent);

module.exports = router;
