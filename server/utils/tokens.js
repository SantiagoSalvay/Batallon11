const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ISS = process.env.JWT_ISSUER || 'batallon11-api';
const AUD = process.env.JWT_AUDIENCE || 'batallon11-app';
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';

function signAccessToken(user, jti) {
  return jwt.sign(
    {
      sub: user.id,
      jti,
      tv: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TTL,
      issuer: ISS,
      audience: AUD,
      algorithm: 'HS256',
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: ISS,
    audience: AUD,
  });
}

function newJti() {
  return crypto.randomBytes(16).toString('hex');
}

function hashRefresh(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function randomRefreshRaw() {
  return crypto.randomBytes(48).toString('base64url');
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  newJti,
  hashRefresh,
  randomRefreshRaw,
  ISS,
  AUD,
};
