const router = require('express').Router();
const { getHero, updateHero } = require('../controllers/heroController');
const { authRequired, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getHero);
router.put('/', authRequired, requireRole('ADMIN', 'EDITOR'), upload.single('heroImage'), updateHero);

module.exports = router;
