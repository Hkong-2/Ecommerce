import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { useDispatch } from 'react-redux';
import { setToken, setUser, setLoading, logout } from '../stores/authSlice';
import { authApi } from '../api/auth';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

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
  }, [searchParams, navigate, dispatch]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};
