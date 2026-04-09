import { api } from './axios';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
}

export const brandsApi = {
  getAllBrands: async (): Promise<Brand[]> => {
    const response = await api.get<Brand[]>('/api/brands');
    return response.data;
  },
};
