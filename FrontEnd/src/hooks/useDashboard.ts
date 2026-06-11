import { useQuery } from '@tanstack/react-query';
import {
  dashboardApi,
  type DashboardSummaryParams,
} from '../api/dashboard';

export const useDashboardSummary = (params: DashboardSummaryParams) => {
  return useQuery({
    queryKey: ['admin-dashboard-summary', params],
    queryFn: () => dashboardApi.getSummary(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
};
