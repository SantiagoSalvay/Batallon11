import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { isValidAdminRouteToken } from '../lib/adminAccess.js';
import { safeInternalPath } from '../lib/safeRedirect.js';
import Seo from '../components/Seo.jsx';

export default function Login() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeInternalPath(location.state?.from?.pathname, '/admin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isValidAdminRouteToken(token)) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const code = needTotp ? totpCode.trim() : undefined;
      await login(email, password, code || undefined, undefined);
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'MFA_REQUIRED') {
        setNeedTotp(true);
        setError('Ingresá el código de tu app de autenticación.');
      } else {
        setError(data?.message || 'No se pudo iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen grid place-items-center px-4 py-24 grain relative overflow-hidden">
      <Seo title="Acceso administrador" noindex />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 opacity-80" />
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={submit}
        className="card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <img src={BRAND_LOGO} alt="Batallón 11" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold">Acceso administrador</h1>
            <p className="text-xs text-white/60">Panel del Batallón 11</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <label className="label">Email</label>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="tu@email.com"
        />

        <label className="label mt-4">Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="••••••••"
        />

        {needTotp && (
          <>
            <label className="label mt-4">Código TOTP (6 dígitos)</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required={needTotp}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="field"
              placeholder="000000"
            />
          </>
        )}

        <button className="btn-primary w-full mt-6" disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <Link to="/" className="block text-center text-sm text-white/60 mt-4 hover:text-white">
          ← Volver al sitio
        </Link>
      </motion.form>
    </section>
  );
}
