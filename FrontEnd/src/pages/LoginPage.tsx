import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    const initializeAuth = async (token: string) => {
      setLoading(true);
      try {
        setToken(token);

        // Fetch user profile with the new token
        const user = await authApi.getProfile();
        setUser(user);

        // Redirect to home using react-router
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Failed to fetch profile during login', error);
        useAuthStore.getState().logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      initializeAuth(token);
    }
  }, [searchParams, navigate, setToken, setUser, setLoading]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};
