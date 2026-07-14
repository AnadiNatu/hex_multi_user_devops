import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { Navbar } from '../components/layout/Navbar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { authStorage } from '@/utils/storage';

export function ProtectedRoute() {
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
        }}
      >
        <div className="absolute inset-0 auth-glow-green pointer-events-none" />
        <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

        <div className="relative z-10">
          <LoadingSpinner
            size="lg"
            text="Loading your workspace..."
          />
        </div>
      </div>
    );
  }

 const token = authStorage.getToken();

if (!user || !token) {

    return <Navigate to="/login" replace />;

}

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 auth-glow-green pointer-events-none" />
      <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

      {/* App */}
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}