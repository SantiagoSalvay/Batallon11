import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { BRAND_LOGO } from '../lib/stageAssets.js';
import { isValidAdminToken, consumeAdminToken } from '../lib/adminAccess.js';

export default function Login() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isValidAdminToken(token)) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      consumeAdminToken();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen grid place-items-center px-4 py-24 grain relative overflow-hidden">
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
          placeholder="admin@batallon11.com"
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
