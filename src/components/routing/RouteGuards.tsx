import {Navigate} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({children, requireAdmin = false}: ProtectedRouteProps) {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({children}: PublicOnlyRouteProps) {
  const {user} = useAuth();

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
