/**
 * Enmascara un email para logging (evita volcar PII en texto plano en los
 * logs de auditoría): conserva el primer carácter del usuario y el dominio.
 * ej: "a***@batallon11.com"
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const maskedUser = user.length <= 1 ? '*' : `${user[0]}***`;
  return `${maskedUser}@${domain}`;
}

function audit(req, action, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    correlationId: req.correlationId ?? null,
    action,
    userId: req.user?.id ?? null,
    userRole: req.user?.role ?? null,
    ip: req.ip,
    ua: (req.get('user-agent') ?? '').slice(0, 200),
    ...meta,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

module.exports = { audit, maskEmail };
