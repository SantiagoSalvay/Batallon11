function formatZodErrors(error) {
  const issues = error.issues || error.errors || [];
  return issues.map((e) => ({
    field: e.path.join('.') || '(root)',
    message: e.message,
  }));
}

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos.',
        errors: formatZodErrors(parsed.error),
      });
    }
    req.body = parsed.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Parámetros inválidos.',
        errors: formatZodErrors(parsed.error),
      });
    }
    req.validatedQuery = parsed.data;
    next();
  };
}

module.exports = { validateBody, validateQuery, formatZodErrors };
