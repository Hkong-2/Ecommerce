import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
}

import { useSelector } from 'react-redux';
import type { RootState } from '../stores/store';

export const useProfile = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data;
    },
    enabled: !!token, // Only run the query if we have a token
    retry: false, // Don't retry if it fails (e.g. 401)
  });
};

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.patch('/users/me', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
