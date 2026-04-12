import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

interface CreateOrderPayload {
  cartItemIds: number[];
  addressId: number;
  paymentMethod: string;
  note?: string;
}

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await api.post('/orders', payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cart data after successful checkout
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useOrderQuery = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};
