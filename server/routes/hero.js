const router = require('express').Router();
const { getHero, updateHero } = require('../controllers/heroController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getHero);
router.put('/', authRequired, upload.single('heroImage'), updateHero);

module.exports = router;
