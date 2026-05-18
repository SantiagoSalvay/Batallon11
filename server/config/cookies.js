const COOKIE_ACCESS = 'b11_access';
const COOKIE_REFRESH = 'b11_refresh';
const COOKIE_CSRF = 'b11_csrf';

function parseSameSite(val) {
  const v = (val || 'lax').toLowerCase();
  if (v === 'strict' || v === 'lax' || v === 'none') return v;
  return 'lax';
}

function baseCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    secure: process.env.COOKIE_SECURE === 'true' || (process.env.COOKIE_SECURE !== 'false' && isProd),
    sameSite: parseSameSite(process.env.COOKIE_SAME_SITE),
    path: '/',
  };
}

function accessCookieMaxAgeMs() {
  const raw = (process.env.ACCESS_TOKEN_TTL || '15m').trim().toLowerCase();
  const m = /^(\d+)m$/.exec(raw);
  if (m) return Number(m[1]) * 60 * 1000;
  const h = /^(\d+)h$/.exec(raw);
  if (h) return Number(h[1]) * 60 * 60 * 1000;
  const s = /^(\d+)s$/.exec(raw);
  if (s) return Number(s[1]) * 1000;
  const d = /^(\d+)d$/.exec(raw);
  if (d) return Number(d[1]) * 24 * 60 * 60 * 1000;
  return 15 * 60 * 1000;
}

function accessCookieOptions() {
  return {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: accessCookieMaxAgeMs(),
  };
}

function refreshCookieOptions() {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  return {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

function csrfCookieOptions() {
  return {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function clearCookieOptions() {
  return {
    ...baseCookieOptions(),
  };
}

module.exports = {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_CSRF,
  accessCookieOptions,
  refreshCookieOptions,
  csrfCookieOptions,
  clearCookieOptions,
};
