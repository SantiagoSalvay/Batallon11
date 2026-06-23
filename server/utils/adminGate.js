const crypto = require('crypto');

function hashGateToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateRawGateToken() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { hashGateToken, generateRawGateToken };
