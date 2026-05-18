const { verifyAccessToken } = require('../utils/tokens');
const prisma = require('../config/prisma');
const { COOKIE_ACCESS } = require('../config/cookies');

function readAccessToken(req) {
  const fromCookie = req.cookies?.[COOKIE_ACCESS];
  if (fromCookie) return fromCookie;
  if (process.env.ALLOW_BEARER_FALLBACK === 'true') {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme === 'Bearer' && token) return token;
  }
  return null;
}

async function authRequired(req, res, next) {
  try {
    const token = readAccessToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Sesión requerida' });
    }

    const payload = verifyAccessToken(token);

    const revoked = await prisma.revokedAccessJti.findUnique({
      where: { jti: payload.jti },
    });
    if (revoked) {
      return res.status(401).json({ message: 'Sesión revocada' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, stageId: true, tokenVersion: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    if (user.tokenVersion !== payload.tv) {
      return res.status(401).json({ message: 'Credenciales obsoletas' });
    }

    const { tokenVersion: _tv, ...sessionUser } = user;
    req.user = sessionUser;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
}

function requireStageScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  if (req.user.role !== 'COORDINATOR') return next();

  if (!req.user.stageId) {
    return res.status(403).json({ message: 'Coordinador sin etapa asignada' });
  }

  const provided =
    req.body?.stageId ?? req.query?.stageId ?? req.params?.stageId;
  if (provided !== undefined && provided !== null && provided !== '') {
    if (Number(provided) !== req.user.stageId) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
  } else if (req.body && typeof req.body === 'object') {
    req.body.stageId = req.user.stageId;
  }
  next();
}

module.exports = { authRequired, requireRole, requireStageScope, readAccessToken };
