import { api } from './axios';
import type { User } from '../types/auth';

export const authApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    // Adjust based on your backend response structure
    return response.data;
  },
};
