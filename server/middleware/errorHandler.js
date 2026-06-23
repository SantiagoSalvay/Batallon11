const isProd = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, _next) {
  const requestId = req.correlationId;

  // eslint-disable-next-line no-console
  console.error('[error]', requestId || '-', err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Conflicto: el recurso ya existe.',
      requestId,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Recurso no encontrado.', requestId });
  }
  if (err.code?.startsWith?.('P2')) {
    return res.status(400).json({ message: 'Error en los datos enviados.', requestId });
  }

  if (err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo supera el tamaño permitido.'
        : 'Error al procesar el archivo.';
    return res.status(400).json({ message: msg, requestId });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token inválido o expirado.', requestId });
  }

  if (err.message === 'REUSE_DETECTED') {
    return res.status(401).json({
      message: 'Sesión inválida. Iniciá sesión nuevamente.',
      requestId,
    });
  }

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message =
    isProd && status >= 500
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  const body = { message, requestId };
  if (!isProd && status >= 500 && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
