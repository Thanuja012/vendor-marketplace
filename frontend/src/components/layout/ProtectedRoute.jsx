import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ roles }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { token } = useSelector((s) => s.auth);
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
