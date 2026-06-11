import {
  BadgeDollarSign,
  CalendarDays,
  Minus,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { DashboardComparableMetric } from '../../api/dashboard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useDashboardSummary } from '../../hooks/useDashboard';
import type { RootState } from '../../stores/store';

type PeriodPreset = 'today' | '7days' | '30days' | 'custom';

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: 'Hôm nay',
  '7days': '7 ngày',
  '30days': '30 ngày',
  custom: 'Tùy chọn',
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('vi-VN');

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const createPresetRange = (preset: Exclude<PeriodPreset, 'custom'>) => {
  const today = startOfLocalDay(new Date());
  const to = addDays(today, 1);

  if (preset === 'today') {
    return { from: today.toISOString(), to: to.toISOString() };
  }

  const days = preset === '7days' ? 7 : 30;
  return {
    from: addDays(to, -days).toISOString(),
    to: to.toISOString(),
  };
};

const createCustomRange = (from: string, to: string) => {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = addDays(new Date(`${to}T00:00:00`), 1);

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
};

const formatPeriod = (from: string, to: string) => {
  const inclusiveTo = new Date(new Date(to).getTime() - 1);
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(from))} - ${formatter.format(inclusiveTo)}`;
};

const getComparisonDisplay = (metric: DashboardComparableMetric) => {
  if (metric.percentageChange === null) {
    return {
      label: metric.current > 0 ? 'Kỳ trước chưa có dữ liệu' : 'Không thay đổi',
      className: 'text-gray-500',
      icon: Minus,
    };
  }

  if (metric.percentageChange > 0) {
    return {
      label: `Tăng ${numberFormatter.format(metric.percentageChange)}%`,
      className: 'text-emerald-600',
      icon: TrendingUp,
    };
  }

  if (metric.percentageChange < 0) {
    return {
      label: `Giảm ${numberFormatter.format(Math.abs(metric.percentageChange))}%`,
      className: 'text-red-600',
      icon: TrendingDown,
    };
  }

  return {
    label: 'Không thay đổi',
    className: 'text-gray-500',
    icon: Minus,
  };
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconBackgroundClassName: string;
  metric?: DashboardComparableMetric;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
  metric,
}: MetricCardProps) {
  const comparison = metric ? getComparisonDisplay(metric) : null;
  const ComparisonIcon = comparison?.icon;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight text-gray-900 xl:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackgroundClassName}`}
        >
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {comparison && ComparisonIcon ? (
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${comparison.className}`}>
            <ComparisonIcon className="h-4 w-4" />
            <span>{comparison.label}</span>
            <span className="font-normal text-gray-400">so với kỳ trước</span>
          </div>
        ) : (
          <p className="text-xs font-medium text-gray-500">{description}</p>
        )}
        {comparison && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="mt-5 h-9 w-36 rounded bg-gray-100" />
          <div className="mt-10 h-px bg-gray-100" />
          <div className="mt-4 h-4 w-44 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const defaultCustomFrom = useMemo(
    () => toDateInputValue(addDays(today, -29)),
    [today],
  );
  const defaultCustomTo = useMemo(() => toDateInputValue(today), [today]);

  const [preset, setPreset] = useState<PeriodPreset>('30days');
  const [customFrom, setCustomFrom] = useState(defaultCustomFrom);
  const [customTo, setCustomTo] = useState(defaultCustomTo);
  const [appliedCustomRange, setAppliedCustomRange] = useState({
    from: defaultCustomFrom,
    to: defaultCustomTo,
  });

  const queryParams = useMemo(() => {
    const range =
      preset === 'custom'
        ? createCustomRange(appliedCustomRange.from, appliedCustomRange.to)
        : createPresetRange(preset);

    return {
      ...range,
      lowStockThreshold: 5,
    };
  }, [appliedCustomRange, preset]);

  const {
    data: summary,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDashboardSummary(queryParams);

  const isCustomRangeInvalid =
    !customFrom || !customTo || customFrom > customTo;

  const applyCustomRange = () => {
    if (isCustomRangeInvalid) return;
    setAppliedCustomRange({ from: customFrom, to: customTo });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Tổng quan
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Xin chào {user?.fullName || 'Admin'}, đây là tình hình cửa hàng trong
            khoảng thời gian đã chọn.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 self-start rounded-xl px-4 lg:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
            Khoảng thời gian
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPreset(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    preset === item
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {PERIOD_LABELS[item]}
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="date"
                  value={customFrom}
                  max={customTo || defaultCustomTo}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="h-9 rounded-lg"
                  aria-label="Ngày bắt đầu"
                />
                <span className="hidden text-gray-400 sm:inline">đến</span>
                <Input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={defaultCustomTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="h-9 rounded-lg"
                  aria-label="Ngày kết thúc"
                />
                <Button
                  type="button"
                  onClick={applyCustomRange}
                  disabled={isCustomRangeInvalid}
                  className="h-9 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                >
                  Áp dụng
                </Button>
              </div>
            )}
          </div>
        </div>

        {preset === 'custom' && isCustomRangeInvalid && (
          <p className="mt-3 text-xs font-medium text-red-600">
            Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.
          </p>
        )}
      </section>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !summary ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Không thể tải dữ liệu dashboard
          </h2>
          <p className="mt-1 text-sm text-red-600">
            {(error as { message?: string })?.message ||
              'Vui lòng thử lại sau.'}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="mt-4 rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-100"
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-500">
              Dữ liệu từ {formatPeriod(summary.period.from, summary.period.to)}
            </p>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-600">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Đang cập nhật
              </span>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Doanh thu hoàn tất"
              value={currencyFormatter.format(summary.revenue.current)}
              description={`Kỳ trước: ${currencyFormatter.format(summary.revenue.previous)}`}
              icon={BadgeDollarSign}
              iconClassName="text-emerald-700"
              iconBackgroundClassName="bg-emerald-50"
              metric={summary.revenue}
            />
            <MetricCard
              title="Đơn hàng"
              value={numberFormatter.format(summary.orders.current)}
              description={`Kỳ trước: ${numberFormatter.format(summary.orders.previous)} đơn`}
              icon={ShoppingBag}
              iconClassName="text-blue-700"
              iconBackgroundClassName="bg-blue-50"
              metric={summary.orders}
            />
            <MetricCard
              title="Tổng khách hàng"
              value={numberFormatter.format(summary.customers.total)}
              description={`${numberFormatter.format(summary.customers.current)} khách hàng mới trong kỳ`}
              icon={Users}
              iconClassName="text-violet-700"
              iconBackgroundClassName="bg-violet-50"
              metric={summary.customers}
            />
            <MetricCard
              title="Tồn kho cần chú ý"
              value={numberFormatter.format(
                summary.inventory.lowStockProducts +
                  summary.inventory.outOfStockProducts,
              )}
              description={`${summary.inventory.lowStockProducts} sắp hết, ${summary.inventory.outOfStockProducts} đã hết hàng`}
              icon={Package}
              iconClassName="text-amber-700"
              iconBackgroundClassName="bg-amber-50"
            />
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h2 className="font-semibold text-indigo-950">Cách tính số liệu</h2>
            <p className="mt-2 text-sm leading-6 text-indigo-800">
              Doanh thu chỉ tính các đơn đã hoàn tất. Mức tồn kho thấp hiện được
              đặt ở tổng số lượng không quá {summary.inventory.threshold} sản
              phẩm trên toàn bộ biến thể. So sánh sử dụng khoảng thời gian liền
              trước có cùng độ dài.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
