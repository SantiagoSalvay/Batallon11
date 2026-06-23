process.env.TOTP_ENCRYPTION_KEY = 'a'.repeat(32);
const { encrypt, decrypt } = require('./cryptoAtRest');

describe('cryptoAtRest', () => {
  test('cifra y descifra correctamente', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  test('dos cifrados del mismo texto producen ciphertext distinto', () => {
    const secret = 'MYSECRET';
    expect(encrypt(secret)).not.toBe(encrypt(secret));
  });

  test('detecta payload manipulado', () => {
    const enc = encrypt('original');
    const parts = enc.split('.');
    parts[2] = 'AAAAAA';
    expect(() => decrypt(parts.join('.'))).toThrow();
  });

  test('devuelve texto plano legacy sin formato cifrado', () => {
    expect(decrypt('PLAIN_SECRET')).toBe('PLAIN_SECRET');
  });
});
