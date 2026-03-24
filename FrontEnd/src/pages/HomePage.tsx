import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to our Store</h1>
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <p className="mb-2"><strong>Name:</strong> {user.fullName}</p>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-4"><strong>Role:</strong> {user.role}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};
