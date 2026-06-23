const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.user?.id ? `upload:u:${req.user.id}` : `upload:ip:${req.ip}`,
  skip: (req) => !req.user,
  message: { message: 'Demasiadas subidas. Intentá más tarde.' },
});

module.exports = { uploadLimiter };
