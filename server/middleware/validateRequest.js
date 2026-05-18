function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos.',
        issues: parsed.error.flatten().fieldErrors,
      });
    }
    req.validatedBody = parsed.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Parámetros inválidos.',
        issues: parsed.error.flatten().fieldErrors,
      });
    }
    req.validatedQuery = parsed.data;
    next();
  };
}

module.exports = { validateBody, validateQuery };
