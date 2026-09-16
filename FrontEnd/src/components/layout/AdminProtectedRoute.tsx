import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../stores/store';
import { logout } from '../../stores/authSlice';
import { isJwtExpired } from '../../utils/jwt';
import { useEffect } from 'react';

export const AdminProtectedRoute = () => {
  const { isAuthenticated, token, user, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const hasExpiredToken = !!token && isJwtExpired(token);

  useEffect(() => {
    if (hasExpiredToken) {
      dispatch(logout());
    }
  }, [dispatch, hasExpiredToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <span className="text-xl animate-pulse text-indigo-500 font-bold tracking-widest">LOADING...</span>
      </div>
    );
  }

  const hasValidAdminSession =
    isAuthenticated &&
    Boolean(token) &&
    !hasExpiredToken &&
    user?.role === 'ADMIN';

  if (!hasValidAdminSession) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
