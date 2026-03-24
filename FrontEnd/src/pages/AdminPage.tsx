import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const AdminPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-semibold mb-4">Hello Admin, {user?.fullName}</h2>
        <p className="mb-4 text-gray-600">You have access to manage the system.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
