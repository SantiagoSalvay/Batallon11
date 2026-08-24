import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function CoordinatorIndexRedirect({ children }) {
  const { user } = useAuth();
  if (user?.role === 'COORDINATOR') {
    return <Navigate to="/admin/publicaciones-etapa" replace />;
  }
  return children;
}
