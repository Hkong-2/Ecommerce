import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface ShippingProvince {
  id: number;
  name: string;
}

export interface ShippingDistrict {
  id: number;
  provinceId: number;
  name: string;
}

export interface ShippingWard {
  code: string;
  districtId: number;
  name: string;
}

export const useShippingProvinces = () => {
  return useQuery<ShippingProvince[]>({
    queryKey: ['shipping', 'provinces'],
    queryFn: async () => {
      const response = await api.get('/shipping/provinces');
      return response.data;
    },
  });
};

export const useShippingDistricts = (provinceId?: number | null) => {
  return useQuery<ShippingDistrict[]>({
    queryKey: ['shipping', 'districts', provinceId],
    queryFn: async () => {
      const response = await api.get('/shipping/districts', {
        params: { provinceId },
      });
      return response.data;
    },
    enabled: !!provinceId,
  });
};

export const useShippingWards = (districtId?: number | null) => {
  return useQuery<ShippingWard[]>({
    queryKey: ['shipping', 'wards', districtId],
    queryFn: async () => {
      const response = await api.get('/shipping/wards', {
        params: { districtId },
      });
      return response.data;
    },
    enabled: !!districtId,
  });
};
