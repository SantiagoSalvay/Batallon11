// Acceso oculto al panel admin.
//
// La URL de login es dinámica: cada vez que se solicita acceso (Ctrl+Shift+L
// o el easter-egg del footer), se genera un token aleatorio que se guarda en
// sessionStorage y se usa como ruta. Solo es válido durante esa sesión y
// solo para el path generado.

const TOKEN_KEY = 'b11:admin-access-token';

function generateToken() {
  if (window.crypto?.getRandomValues) {
    const arr = new Uint8Array(24);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export function requestAdminAccess(navigate) {
  const token = generateToken();
  sessionStorage.setItem(TOKEN_KEY, token);
  navigate(`/p/${token}`, { replace: true });
}

export function isValidAdminToken(token) {
  if (!token) return false;
  return sessionStorage.getItem(TOKEN_KEY) === token;
}

export function consumeAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
