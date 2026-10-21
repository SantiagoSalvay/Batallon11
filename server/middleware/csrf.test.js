const { safeCompare, requireCsrf } = require('../middleware/csrf');

describe('csrf safeCompare', () => {
  test('coincide con strings iguales', () => {
    expect(safeCompare('abc', 'abc')).toBe(true);
  });

  test('rechaza strings distintos', () => {
    expect(safeCompare('abc', 'abd')).toBe(false);
  });

  test('rechaza longitudes distintas', () => {
    expect(safeCompare('abc', 'abcd')).toBe(false);
  });
});

function runCsrf({ method = 'POST', url, cookie, header }) {
  const req = {
    method,
    originalUrl: url,
    cookies: cookie ? { b11_csrf: cookie } : {},
    get: (name) => (name.toLowerCase() === 'x-csrf-token' ? header : undefined),
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let passed = false;
  requireCsrf(req, res, () => {
    passed = true;
  });
  return { passed, res };
}

describe('requireCsrf: rutas exentas', () => {
  test('refresh sigue exento', () => {
    expect(runCsrf({ url: '/api/auth/refresh' }).passed).toBe(true);
  });

  test('prepare sigue exento', () => {
    expect(runCsrf({ url: '/api/auth/prepare' }).passed).toBe(true);
  });

  // El endpoint publico que emitia gate tokens fue eliminado; si volviera a
  // aparecer, no debe entrar por la puerta de atras sin CSRF.
  test('gate ya no esta exento', () => {
    const { passed, res } = runCsrf({ url: '/api/auth/gate' });
    expect(passed).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  // La exencion antigua usaba endsWith(), asi que cualquier ruta terminada en
  // /auth/refresh se colaba.
  test('una ruta que solo termina en /auth/refresh no esta exenta', () => {
    const { passed, res } = runCsrf({ url: '/api/posts/auth/refresh' });
    expect(passed).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  test('un POST normal pasa con cookie y header coincidentes', () => {
    const token = 'a'.repeat(64);
    expect(runCsrf({ url: '/api/posts', cookie: token, header: token }).passed).toBe(
      true
    );
  });

  test('un POST normal se rechaza si no coinciden', () => {
    const { passed, res } = runCsrf({
      url: '/api/posts',
      cookie: 'a'.repeat(64),
      header: 'b'.repeat(64),
    });
    expect(passed).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});
