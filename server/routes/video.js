const router = require('express').Router();
const { getVideo, updateVideo } = require('../controllers/videoController');
const { authRequired } = require('../middleware/auth');

router.get('/', getVideo);
router.put('/', authRequired, updateVideo);

module.exports = router;
