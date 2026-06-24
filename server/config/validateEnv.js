/**
 * Valida variables criticas al arrancar. En produccion, los errores detienen la API.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  const push = (message, critical = isProd) => {
    (critical ? errors : warnings).push(message);
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    push('JWT_SECRET no esta definido.');
  } else if (jwtSecret.length < 32) {
    push('JWT_SECRET debe tener al menos 32 caracteres.');
  }

  const storageVars = [
    'SUPABASE_S3_ENDPOINT',
    'SUPABASE_S3_REGION',
    'SUPABASE_S3_ACCESS_KEY_ID',
    'SUPABASE_S3_SECRET_ACCESS_KEY',
    'SUPABASE_STORAGE_BUCKET',
    'SUPABASE_PROJECT_URL',
  ];
  const missingStorage = storageVars.filter((name) => !process.env[name]?.trim());
  if (missingStorage.length) {
    push(`Faltan variables de almacenamiento S3: ${missingStorage.join(', ')}.`);
  }

  if (isProd) {
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL es requerida en produccion.');
    }

    const cookieSecret = process.env.COOKIE_SIGNING_SECRET;
    if (!cookieSecret || cookieSecret.length < 32) {
      errors.push('COOKIE_SIGNING_SECRET debe tener al menos 32 caracteres en produccion.');
    }

    const clientUrl = (process.env.CLIENT_URL || '').trim();
    if (!clientUrl) {
      errors.push('CLIENT_URL es requerida en produccion.');
    } else if (/localhost|127\.0\.0\.1/i.test(clientUrl)) {
      errors.push('CLIENT_URL no debe apuntar a localhost en produccion.');
    }

    if (process.env.ALLOW_BEARER_FALLBACK === 'true') {
      errors.push('ALLOW_BEARER_FALLBACK no debe estar habilitado en produccion.');
    }

    if (process.env.COOKIE_SECURE === 'false') {
      warnings.push('COOKIE_SECURE=false en produccion reduce la seguridad de las cookies.');
    }
  }

  for (const warning of warnings) {
    console.warn(`[env] ${warning}`);
  }

  if (errors.length) {
    console.error('[env] Configuracion invalida:\n' + errors.map((error) => `  - ${error}`).join('\n'));
    process.exit(1);
  }
}

module.exports = { validateEnv };