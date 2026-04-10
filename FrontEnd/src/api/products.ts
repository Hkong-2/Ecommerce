import { api } from './axios';

export interface HomepageProduct {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  brandName: string;
  lowestPrice: number | null;
}

export interface PaginatedProductsResponse {
  data: HomepageProduct[];
  total: number;
  hasMore: boolean;
}

export const productsApi = {
  getHomepageProducts: async (page: number = 1, limit: number = 6): Promise<PaginatedProductsResponse> => {
    const response = await api.get<PaginatedProductsResponse>(`/api/products/homepage`, {
      params: { page, limit }
    });
    return response.data;
  },
};
