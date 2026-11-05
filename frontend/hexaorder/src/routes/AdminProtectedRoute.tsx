import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { authStorage } from '@/utils/storage';

interface Props {
  allowedRoles?: string[]; // defaults to all admin roles
}

const ADMIN_ROLES = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];

export function AdminProtectedRoute({ allowedRoles = ADMIN_ROLES }: Props) {
  const user  = useAppSelector((state) => state.auth.user);
  const token = authStorage.getToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rawRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
