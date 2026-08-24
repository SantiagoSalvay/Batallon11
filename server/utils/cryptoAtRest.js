const crypto = require('crypto');

function getDerivedKey() {
  // No debe reusarse JWT_SECRET: son dominios de seguridad distintos (firma de
  // sesión vs. cifrado de secretos TOTP). Si JWT_SECRET se filtrara, reusarlo
  // aquí permitiría además descifrar los TOTP de todos los usuarios.
  const keyMaterial = process.env.TOTP_ENCRYPTION_KEY;
  if (!keyMaterial || keyMaterial.length < 32) {
    throw new Error('TOTP_ENCRYPTION_KEY debe estar definida y tener al menos 32 caracteres');
  }
  if (process.env.JWT_SECRET && keyMaterial === process.env.JWT_SECRET) {
    throw new Error('TOTP_ENCRYPTION_KEY no debe coincidir con JWT_SECRET');
  }
  return crypto.createHash('sha256').update(keyMaterial).digest();
}

function encrypt(plaintext) {
  const KEY = getDerivedKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64url'),
    tag.toString('base64url'),
    enc.toString('base64url'),
  ].join('.');
}

function decrypt(payload) {
  if (!payload || typeof payload !== 'string') {
    throw new Error('Payload cifrado inválido');
  }
  // MIGRATION: secretos TOTP en texto plano (pre-cifrado) se devuelven tal cual
  if (payload.split('.').length !== 3) {
    return payload;
  }
  const KEY = getDerivedKey();
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Payload cifrado inválido');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    KEY,
    Buffer.from(ivB64, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
  return (
    decipher.update(Buffer.from(dataB64, 'base64url'), undefined, 'utf8') +
    decipher.final('utf8')
  );
}

module.exports = { encrypt, decrypt };
