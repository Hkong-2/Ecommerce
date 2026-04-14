import { useMutation } from '@tanstack/react-query';
import { api as axiosInstance } from '../api/axios';

export const useCalculateShippingFee = () => {
  return useMutation({
    mutationFn: async ({ districtId, wardCode }: { districtId: number; wardCode: string }) => {
      const response = await axiosInstance.post('/orders/shipping-fee', { districtId, wardCode });
      return response.data;
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: { addressId: number; paymentMethod: string }) => {
      const response = await axiosInstance.post('/orders', data);
      return response.data;
    },
  });
};
