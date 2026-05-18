const rateLimit = require('express-rate-limit');

/** Por IP: evita abuso de disco/CPU (sharp) en ventana de 1 hora. */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas subidas. Intentá más tarde.' },
});

module.exports = { uploadLimiter };
