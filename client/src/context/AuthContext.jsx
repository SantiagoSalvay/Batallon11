import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';
import { getStoredGateToken, clearGateToken } from '../lib/adminAccess.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      await api.get('/auth/prepare').catch(() => {});
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password, totpCode, turnstileToken) => {
    const gateToken = getStoredGateToken();
    try {
      // Garantiza que la cookie CSRF exista antes de un POST que ahora la exige.
      await api.get('/auth/prepare').catch(() => {});
      const { data } = await api.post(
        '/auth/login',
        { email, password, totpCode, turnstileToken },
        { headers: { 'X-Admin-Gate': gateToken } }
      );
      setUser(data.user);
      return data.user;
    } finally {
      clearGateToken();
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignorar */
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}
