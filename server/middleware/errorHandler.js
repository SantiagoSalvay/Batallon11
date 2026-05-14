function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Conflicto: ya existe un registro con ese valor único.',
      field: err.meta?.target,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Recurso no encontrado.' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Error de archivo: ${err.message}` });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;
