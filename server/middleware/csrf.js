const crypto = require('crypto');
const { COOKIE_CSRF, csrfCookieOptions } = require('../config/cookies');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function generateCsrfValue() {
  return crypto.randomBytes(32).toString('hex');
}

function ensureCsrfCookie(req, res) {
  let token = req.cookies?.[COOKIE_CSRF];
  if (!token || typeof token !== 'string' || token.length < 32) {
    token = generateCsrfValue();
    res.cookie(COOKIE_CSRF, token, csrfCookieOptions());
  }
  return token;
}

/**
 * Double-submit: valor en cookie legible por el cliente + header X-CSRF-Token.
 */
function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const pathOnly = req.originalUrl.split('?')[0];
  if (
    pathOnly.endsWith('/auth/login') ||
    pathOnly.endsWith('/auth/refresh') ||
    pathOnly.endsWith('/auth/prepare')
  ) {
    return next();
  }

  const cookieVal = req.cookies?.[COOKIE_CSRF];
  const headerVal = req.get('x-csrf-token');

  if (!cookieVal || !headerVal || cookieVal !== headerVal) {
    return res.status(403).json({ message: 'CSRF token inválido o ausente.' });
  }
  next();
}

module.exports = { ensureCsrfCookie, requireCsrf };
