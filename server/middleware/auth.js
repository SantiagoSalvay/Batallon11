const { verifyToken } = require('../utils/tokens');
const prisma = require('../config/prisma');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, stageId: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
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
  } else {
    if (req.body && typeof req.body === 'object') req.body.stageId = req.user.stageId;
  }
  next();
}

module.exports = { authRequired, requireRole, requireStageScope };
