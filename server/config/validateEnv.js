/**
 * Valida variables críticas al arranque. En producción falla si faltan secretos fuertes.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  const push = (msg, critical = isProd) => {
    (critical ? errors : warnings).push(msg);
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    push('JWT_SECRET no está definido.');
  } else if (jwtSecret.length < 32) {
    push('JWT_SECRET debe tener al menos 32 caracteres.');
  }

  if (isProd) {
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL es requerida en producción.');
    }

    const cookieSecret = process.env.COOKIE_SIGNING_SECRET;
    if (!cookieSecret || cookieSecret.length < 32) {
      errors.push('COOKIE_SIGNING_SECRET debe tener al menos 32 caracteres en producción.');
    }

    const clientUrl = (process.env.CLIENT_URL || '').trim();
    if (!clientUrl) {
      errors.push('CLIENT_URL es requerida en producción.');
    } else if (/localhost|127\.0\.0\.1/i.test(clientUrl)) {
      errors.push('CLIENT_URL no debe apuntar a localhost en producción.');
    }

    if (process.env.ALLOW_BEARER_FALLBACK === 'true') {
      errors.push('ALLOW_BEARER_FALLBACK no debe estar habilitado en producción.');
    }

    if (process.env.COOKIE_SECURE === 'false') {
      warnings.push('COOKIE_SECURE=false en producción reduce la seguridad de las cookies.');
    }
  }

  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(`[env] ${w}`);
  }

  if (errors.length) {
    // eslint-disable-next-line no-console
    console.error('[env] Configuración inválida:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
}

module.exports = { validateEnv };
