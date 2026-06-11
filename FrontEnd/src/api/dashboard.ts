import { api } from './axios';

export interface DashboardComparableMetric {
  current: number;
  previous: number;
  change: number;
  percentageChange: number | null;
}

export interface DashboardSummary {
  period: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  revenue: DashboardComparableMetric;
  orders: DashboardComparableMetric;
  customers: DashboardComparableMetric & {
    total: number;
  };
  inventory: {
    lowStockProducts: number;
    outOfStockProducts: number;
    threshold: number;
    comparisonAvailable: boolean;
  };
}

export interface DashboardSummaryParams {
  from: string;
  to: string;
  lowStockThreshold?: number;
}

export const dashboardApi = {
  getSummary: async (
    params: DashboardSummaryParams,
  ): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>(
      '/admin/dashboard/summary',
      { params },
    );

    return response.data;
  },
};
