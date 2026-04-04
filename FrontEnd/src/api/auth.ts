import { api } from './axios';
import type { User } from '../types/auth';

export const authApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    // Adjust based on your backend response structure
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminLogin: async (credentials: any): Promise<{ access_token: string }> => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },
};
