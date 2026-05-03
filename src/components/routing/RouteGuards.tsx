import {Navigate} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth';
import type {User} from '@/types';

const ADMIN_EMAIL = 'walidkalikali02@gmail.com';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({children, requireAdmin = false}: ProtectedRouteProps) {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#c6a355] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const normalizedEmail = (user?.email || '').toLowerCase();
    const isAdmin =
      (user as User & {role?: string})?.role === 'admin' || normalizedEmail === ADMIN_EMAIL;
    if (!isAdmin) {
      return <Navigate to="/403" replace />;
    }
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

export default ProtectedRoute;
