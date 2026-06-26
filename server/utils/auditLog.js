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

module.exports = { audit };
