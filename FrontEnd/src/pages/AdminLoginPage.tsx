import React from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLoginForm } from '../features/auth/components/AdminLoginForm';

export const AdminLoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <AdminLoginForm />
    </AuthLayout>
  );
};
