const { hashGateToken, generateRawGateToken } = require('./adminGate');

describe('adminGate', () => {
  test('generateRawGateToken produce 48 hex chars', () => {
    const raw = generateRawGateToken();
    expect(raw).toMatch(/^[0-9a-f]{48}$/);
  });

  test('hashGateToken es determinista', () => {
    const raw = 'abc123';
    expect(hashGateToken(raw)).toBe(hashGateToken(raw));
  });
});
