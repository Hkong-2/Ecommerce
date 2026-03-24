import React from 'react';
import { useAuth } from '../stores/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <button
          onClick={loginWithGoogle}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
