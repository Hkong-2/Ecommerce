import { api } from './axios';

export interface HomepageProduct {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  brandName: string;
  lowestPrice: number | null;
}

export const productsApi = {
  getHomepageProducts: async (): Promise<HomepageProduct[]> => {
    const response = await api.get<HomepageProduct[]>('/api/products/homepage');
    return response.data;
  },
};
