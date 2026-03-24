import React from 'react';
import { useAuth } from '../stores/AuthContext';
import { Navigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>

        <div className="mb-4">
          <p className="text-gray-700">Email: {user.email}</p>
          <p className="text-gray-700 font-semibold mt-2">
            Role: <span className={user.role === 'ADMIN' ? 'text-red-500' : 'text-blue-500'}>{user.role}</span>
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
