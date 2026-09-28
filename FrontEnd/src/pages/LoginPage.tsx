import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { useDispatch } from 'react-redux';
import { setToken, setUser, setLoading, logout } from '../stores/authSlice';
import { authApi } from '../api/auth';
import { CircleNotch } from '@phosphor-icons/react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = searchParams.get('token');

  useEffect(() => {
    const initializeAuth = async (token: string) => {
      dispatch(setLoading(true));
      try {
        dispatch(setToken(token));

        // Fetch user profile with the new token
        const user = await authApi.getProfile();
        dispatch(setUser(user));

        // Get redirect path or default to '/'
        const redirectPath = searchParams.get('redirect') || '/';

        // Redirect to the originally requested page
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Failed to fetch profile during login', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (token) {
      initializeAuth(token);
    }
  }, [searchParams, navigate, dispatch, token]);

  if (token) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <CircleNotch weight="bold" className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Đang xác thực đăng nhập...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

