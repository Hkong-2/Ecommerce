import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../stores/store';

export const AdminProtectedRoute = () => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <span className="text-xl animate-pulse text-indigo-500 font-bold tracking-widest">LOADING...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated but not an admin, redirect to user home
  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
