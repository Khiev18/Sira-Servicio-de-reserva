// src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../ui';

/**
 * Protege rutas:
 * - Si no hay sesión → redirige a /login
 * - Si el rol no coincide → redirige al panel del usuario autenticado
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.rol)) {
    const home = user.rol === 'admin' ? '/admin'
               : user.rol === 'tecnico' ? '/tecnico'
               : '/cliente';
    return <Navigate to={home} replace />;
  }

  return children;
}
