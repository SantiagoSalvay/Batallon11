const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const prisma = require('../config/prisma');
const { login, refresh, logout, prepare, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');
const { validateBody } = require('../middleware/validateRequest');
const { loginSchema } = require('../schemas/authSchemas');
const { hashGateToken, generateRawGateToken } = require('../utils/adminGate');

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

const gateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/prepare', prepare);

router.post('/gate', gateRateLimit, async (req, res, next) => {
  try {
    const raw = generateRawGateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.desafioAccesoAdmin.create({
      data: { tokenHash: hashGateToken(raw), expiresAt },
    });
    await prisma.desafioAccesoAdmin.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    res.json({ gateToken: raw, expiresInSec: 600 });
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginSlow, loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', authRequired, logout);
router.get('/me', authRequired, me);

module.exports = router;
