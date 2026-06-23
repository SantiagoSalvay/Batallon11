const crypto = require('crypto');
const prisma = require('../config/prisma');
const { decrypt } = require('./cryptoAtRest');

function hashTotpCode(code, userId) {
  return crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex');
}

async function verifyTotpAntiReplay(userId, code) {
  const codeHash = hashTotpCode(code, userId);
  const windowEnd = new Date(Date.now() + 90_000);

  const existing = await prisma.codigoTotpUsado.findFirst({
    where: {
      userId,
      codeHash,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) return false;

  await prisma.codigoTotpUsado.create({
    data: { userId, codeHash, expiresAt: windowEnd },
  });

  await prisma.codigoTotpUsado.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return true;
}

module.exports = { hashTotpCode, verifyTotpAntiReplay };
