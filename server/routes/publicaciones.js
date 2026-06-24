const router = require('express').Router();
const {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarImagenPublicacion,
  eliminarPublicacion,
} = require('../controllers/publicacionController');
const { authRequired, requireRole } = require('../middleware/auth');
const { attachUserOptional } = require('../middleware/attachUserOptional');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/uploadLimiter');

router.get('/', attachUserOptional, listarPublicaciones);
router.get('/:id', attachUserOptional, obtenerPublicacion);
router.post(
  '/',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.array('imagenes', 6),
  crearPublicacion,
);
router.put(
  '/:id',
  uploadLimiter,
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  upload.array('imagenes', 6),
  actualizarPublicacion,
);
router.delete(
  '/:id/imagenes/:imagenId',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  eliminarImagenPublicacion,
);
router.delete(
  '/:id',
  authRequired,
  requireRole('ADMIN', 'EDITOR', 'COORDINATOR'),
  eliminarPublicacion,
);

module.exports = router;
