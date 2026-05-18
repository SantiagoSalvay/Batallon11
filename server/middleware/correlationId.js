const crypto = require('crypto');

const HEADER = 'x-request-id';

function correlationId(req, res, next) {
  const incoming = req.get(HEADER);
  const id = incoming && /^[a-zA-Z0-9-]{8,128}$/.test(incoming) ? incoming : crypto.randomBytes(16).toString('hex');
  req.correlationId = id;
  res.setHeader(HEADER, id);
  next();
}

module.exports = { correlationId, HEADER };
