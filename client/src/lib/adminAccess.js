import { api } from '../services/api.js';

const TOKEN_KEY = 'b11:admin-access-token';
const ROUTE_KEY = 'b11:admin-route-token';

export async function requestAdminAccess(navigate) {
  try {
    const { data } = await api.post('/auth/gate');
    sessionStorage.setItem(TOKEN_KEY, data.gateToken);
    sessionStorage.setItem(ROUTE_KEY, data.gateToken.slice(0, 16));
    navigate(`/p/${data.gateToken.slice(0, 16)}`, { replace: true });
  } catch {
    navigate('/', { replace: true });
  }
}

export function getStoredGateToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export function isValidAdminRouteToken(routeToken) {
  if (!routeToken) return false;
  const stored = sessionStorage.getItem(ROUTE_KEY);
  const gate = sessionStorage.getItem(TOKEN_KEY);
  return stored === routeToken && Boolean(gate);
}

export function clearGateToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROUTE_KEY);
}
