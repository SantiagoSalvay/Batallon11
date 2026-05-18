const isProd = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[error]', req.correlationId || '-', err);

  const requestId = req.correlationId;

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Conflicto: ya existe un registro con ese valor único.',
      field: err.meta?.target,
      requestId,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Recurso no encontrado.', requestId });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Error de archivo: ${err.message}`, requestId });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token inválido o expirado.', requestId });
  }

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message =
    isProd && status >= 500 ? 'Error interno del servidor' : err.message || 'Error interno del servidor';

  res.status(status).json({ message, requestId });
}

module.exports = errorHandler;
