const crypto = require('crypto');
const prisma = require('../config/prisma');
const { decrypt } = require('./cryptoAtRest');

function hashTotpCode(code, userId) {
  return crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex');
}

async function verifyTotpAntiReplay(userId, code) {
  const codeHash = hashTotpCode(code, userId);
  const windowEnd = new Date(Date.now() + 90_000);

  const existing = await prisma.totpUsedCode.findFirst({
    where: {
      userId,
      codeHash,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) return false;

  await prisma.totpUsedCode.create({
    data: { userId, codeHash, expiresAt: windowEnd },
  });

  await prisma.totpUsedCode.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return true;
}

module.exports = { hashTotpCode, verifyTotpAntiReplay };
