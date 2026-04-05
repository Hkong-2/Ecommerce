import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { authApi } from '../../../api/auth';
import { EnvelopeSimple, LockKey } from '@phosphor-icons/react';

export const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setToken, setUser, setLoading } = useAuthStore();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with admin credentials
      const { access_token } = await authApi.adminLogin({ email, password });
      setToken(access_token);

      // Fetch user profile
      const user = await authApi.getProfile();
      setUser(user);

      // Redirect to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to login as admin', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 uppercase">
          Admin <span className="text-indigo-600">Portal</span>
        </h2>
        <p className="text-zinc-500 text-sm">
          Sign in to manage the platform
        </p>
      </div>

      <form onSubmit={handleAdminLogin} className="space-y-6 pt-4 w-full">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <EnvelopeSimple className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all duration-300"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockKey className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all duration-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="group relative flex w-full items-center justify-center space-x-3 rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 active:scale-[0.98]"
        >
          <span className="text-lg">Access Portal</span>
        </button>
      </form>
    </div>
  );
};
