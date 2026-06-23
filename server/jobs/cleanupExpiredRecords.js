const prisma = require('../config/prisma');

async function cleanupExpiredRecords() {
  const now = new Date();
  const [jtiResult, gateResult, totpResult] = await Promise.all([
    prisma.revokedAccessJti.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.adminGateChallenge.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.totpUsedCode.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: now.toISOString(),
      action: 'cleanup.expired_records',
      revokedJti: jtiResult.count,
      gateTokens: gateResult.count,
      totpCodes: totpResult.count,
    })
  );
}

if (require.main === module) {
  cleanupExpiredRecords()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { cleanupExpiredRecords };
