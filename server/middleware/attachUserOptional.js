const prisma = require('../config/prisma');
const { COOKIE_ACCESS } = require('../config/cookies');
const { verifyAccessToken } = require('../utils/tokens');

async function attachUserOptional(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_ACCESS];
    if (!token) return next();

    const payload = verifyAccessToken(token);

    const revoked = await prisma.revokedAccessJti.findUnique({
      where: { jti: payload.jti },
    });
    if (revoked) return next();

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, stageId: true, tokenVersion: true },
    });

    if (user && user.tokenVersion === payload.tv) {
      const { tokenVersion: _tv, ...pub } = user;
      req.user = pub;
    }
  } catch {
    /* sin sesión válida: seguir como anónimo */
  }
  next();
}

module.exports = { attachUserOptional };
