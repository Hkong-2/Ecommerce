import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface CreateAddressData {
  receiverName: string;
  receiverPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAddressData) => {
      const response = await api.post('/users/me/addresses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAddressData }) => {
      const response = await api.patch(`/users/me/addresses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/users/me/addresses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
