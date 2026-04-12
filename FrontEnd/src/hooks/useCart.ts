import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axiosInstance } from '../api/axios';
import { toast } from 'sonner';

// Tạm thời định nghĩa các type ở đây (hoặc đưa vào file types riêng)
export interface CartItem {
  id: number;
  skuId: number;
  quantity: number;
  addedAt: string;
  sku: {
    id: number;
    skuCode: string;
    price: number;
    originalPrice: number | null;
    attributes: Record<string, any>;
    stock: number;
  };
  product: {
    id: number;
    name: string;
    slug: string;
    brandName: string;
    thumbnailUrl: string;
  };
}

export const cartKeys = {
  all: ['cart'] as const,
};

export const useCartQuery = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: async (): Promise<CartItem[]> => {
      const response = await axiosInstance.get('/cart');
      return response.data;
    },
    enabled: isAuthenticated, // Chỉ gọi API khi đã đăng nhập
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skuId, quantity }: { skuId: number; quantity: number }) => {
      const response = await axiosInstance.post('/cart', { skuId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng';
      toast.error(message);
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skuId, quantity }: { skuId: number; quantity: number }) => {
      const response = await axiosInstance.patch(`/cart/${skuId}`, { quantity });
      return response.data;
    },
    onMutate: async (newItem) => {
      // Bỏ qua update UI nếu cần (tùy chọn) - ở đây chỉ làm invalidate đơn giản
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart = queryClient.getQueryData<CartItem[]>(cartKeys.all);

      // Optimistic update
      if (previousCart) {
        queryClient.setQueryData<CartItem[]>(cartKeys.all, (old) => {
          if (!old) return old;
          return old.map((item) =>
            item.skuId === newItem.skuId ? { ...item, quantity: newItem.quantity } : item
          );
        });
      }

      return { previousCart };
    },
    onError: (err: any, _newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.all, context.previousCart);
      }
      const message = err.response?.data?.message || 'Có lỗi khi cập nhật số lượng';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skuId: number) => {
      const response = await axiosInstance.delete(`/cart/${skuId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete('/cart');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Đã xóa toàn bộ giỏ hàng');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa giỏ hàng');
    },
  });
};
