import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink-900 text-white/70">
        Cargando…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}
