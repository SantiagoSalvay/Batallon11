const WEAK_VALUES = new Set([
  'changeme',
  'secret',
  'password',
  'jwt_secret',
  'test',
  '1234',
  '12345678',
  'admin',
  'qwerty',
]);

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  const push = (msg, critical = isProd) => {
    (critical ? errors : warnings).push(msg);
  };

  const jwtSecret = process.env.JWT_SECRET;
  const cookieSecret = process.env.COOKIE_SIGNING_SECRET;

  if (!jwtSecret) {
    push('JWT_SECRET no está definido.');
  } else if (jwtSecret.length < 32) {
    push('JWT_SECRET debe tener al menos 32 caracteres.');
  } else if (WEAK_VALUES.has(jwtSecret.toLowerCase())) {
    push('JWT_SECRET tiene un valor demasiado débil.');
  }

  if (isProd) {
    if (!cookieSecret || cookieSecret.length < 32) {
      errors.push('COOKIE_SIGNING_SECRET debe tener al menos 32 caracteres en producción.');
    } else if (WEAK_VALUES.has(cookieSecret.toLowerCase())) {
      errors.push('COOKIE_SIGNING_SECRET tiene un valor demasiado débil.');
    }

    if (jwtSecret && cookieSecret && jwtSecret === cookieSecret) {
      errors.push('JWT_SECRET y COOKIE_SIGNING_SECRET deben ser distintos entre sí.');
    }

    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL es requerida en producción.');
    } else if (!process.env.DATABASE_URL.includes('sslmode=require')) {
      errors.push('DATABASE_URL en producción debe incluir sslmode=require.');
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
  } else {
    if (jwtSecret && cookieSecret && jwtSecret === cookieSecret) {
      warnings.push('JWT_SECRET y COOKIE_SIGNING_SECRET deberían ser distintos.');
    }
    if (!process.env.DATABASE_URL) {
      warnings.push('DATABASE_URL no está definida.');
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
