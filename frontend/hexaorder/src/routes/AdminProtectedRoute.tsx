// src/routes/AdminProtectedRoute.tsx
// Drop-in replacement for ProtectedRoute on admin routes.
// Identical auth/redirect logic — only the background changes to dark slate.
// Zero changes to any existing component needed.

// import { Navigate, Outlet } from 'react-router-dom';
// import { useAppSelector } from '../app/hooks';
// import { Navbar } from '../components/layout/Navbar';
// import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// export function AdminProtectedRoute() {
//   const user   = useAppSelector((state) => state.auth.user);
//   const status = useAppSelector((state) => state.auth.status);

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-950">
//         <LoadingSpinner size="lg" text="Loading..." />
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     // Dark background — replaces the bg-slate-100 in ProtectedRoute
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//       <Navbar />
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }


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
