const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { login, refresh, logout, prepare, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');
const { validateBody } = require('../middleware/validateRequest');
const { loginSchema } = require('../schemas/authSchemas');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_MAX_ATTEMPTS || 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().slice(0, 255) : '';
    return email ? `${req.ip}:${email}` : req.ip;
  },
  message: { message: 'Demasiados intentos. Intentá más tarde.' },
});

const loginSlow = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 120,
  maxDelayMs: 2500,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.REFRESH_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
});

// Aca vivia POST /gate, que emitia un "gate token" a cualquiera que lo pidiera
// y por lo tanto no agregaba ninguna barrera. El acceso al panel se apoya en la
// contrasena, el TOTP opcional y los limites de abajo; la ruta /p del cliente
// solo mantiene el formulario fuera de la navegacion visible.

router.get('/prepare', prepare);

router.post('/login', loginSlow, loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', authRequired, logout);
router.get('/me', authRequired, me);

module.exports = router;
