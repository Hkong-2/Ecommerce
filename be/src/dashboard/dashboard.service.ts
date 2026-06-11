import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';

const DEFAULT_PERIOD_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type ComparableMetric = {
  current: number;
  previous: number;
  change: number;
  percentageChange: number | null;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: DashboardSummaryQueryDto) {
    const period = this.resolvePeriod(query.from, query.to);
    const lowStockThreshold = query.lowStockThreshold ?? 5;

    const currentOrderWhere = {
      createdAt: {
        gte: period.current.from,
        lt: period.current.to,
      },
    };
    const previousOrderWhere = {
      createdAt: {
        gte: period.previous.from,
        lt: period.previous.to,
      },
    };
    const currentCustomerWhere = {
      role: Role.USER,
      createdAt: {
        gte: period.current.from,
        lt: period.current.to,
      },
    };
    const previousCustomerWhere = {
      role: Role.USER,
      createdAt: {
        gte: period.previous.from,
        lt: period.previous.to,
      },
    };

    const [
      currentRevenueAggregate,
      previousRevenueAggregate,
      currentOrderCount,
      previousOrderCount,
      currentCustomerCount,
      previousCustomerCount,
      totalCustomerCount,
      stockByProduct,
      activeProductsWithoutSkus,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          ...currentOrderWhere,
          status: OrderStatus.COMPLETED,
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          ...previousOrderWhere,
          status: OrderStatus.COMPLETED,
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: currentOrderWhere }),
      this.prisma.order.count({ where: previousOrderWhere }),
      this.prisma.user.count({ where: currentCustomerWhere }),
      this.prisma.user.count({ where: previousCustomerWhere }),
      this.prisma.user.count({ where: { role: Role.USER } }),
      this.prisma.sKU.groupBy({
        by: ['productId'],
        where: {
          product: {
            isActive: true,
          },
        },
        _sum: {
          stock: true,
        },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          skus: {
            none: {},
          },
        },
      }),
    ]);

    const currentRevenue = currentRevenueAggregate._sum.totalAmount ?? 0;
    const previousRevenue = previousRevenueAggregate._sum.totalAmount ?? 0;
    const lowStockProducts = stockByProduct.filter(
      (product) =>
        (product._sum.stock ?? 0) > 0 &&
        (product._sum.stock ?? 0) <= lowStockThreshold,
    ).length;
    const outOfStockProducts =
      stockByProduct.filter((product) => (product._sum.stock ?? 0) <= 0)
        .length + activeProductsWithoutSkus;

    return {
      period: {
        from: period.current.from.toISOString(),
        to: period.current.to.toISOString(),
        previousFrom: period.previous.from.toISOString(),
        previousTo: period.previous.to.toISOString(),
      },
      revenue: this.createComparableMetric(
        currentRevenue,
        previousRevenue,
      ),
      orders: this.createComparableMetric(
        currentOrderCount,
        previousOrderCount,
      ),
      customers: {
        ...this.createComparableMetric(
          currentCustomerCount,
          previousCustomerCount,
        ),
        total: totalCustomerCount,
      },
      inventory: {
        lowStockProducts,
        outOfStockProducts,
        threshold: lowStockThreshold,
        comparisonAvailable: false,
      },
    };
  }

  private resolvePeriod(from?: string, to?: string) {
    const currentTo = to
      ? this.parsePeriodEnd(to)
      : new Date();
    const currentFrom = from
      ? new Date(from)
      : new Date(currentTo.getTime() - DEFAULT_PERIOD_DAYS * MILLISECONDS_PER_DAY);

    if (
      Number.isNaN(currentFrom.getTime()) ||
      Number.isNaN(currentTo.getTime())
    ) {
      throw new BadRequestException('Invalid dashboard date range');
    }

    if (currentFrom >= currentTo) {
      throw new BadRequestException('`from` must be earlier than `to`');
    }

    const duration = currentTo.getTime() - currentFrom.getTime();
    const previousTo = new Date(currentFrom);
    const previousFrom = new Date(currentFrom.getTime() - duration);

    return {
      current: {
        from: currentFrom,
        to: currentTo,
      },
      previous: {
        from: previousFrom,
        to: previousTo,
      },
    };
  }

  private parsePeriodEnd(value: string) {
    const parsed = new Date(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      parsed.setUTCDate(parsed.getUTCDate() + 1);
    }

    return parsed;
  }

  private createComparableMetric(
    current: number,
    previous: number,
  ): ComparableMetric {
    const change = current - previous;

    return {
      current,
      previous,
      change,
      percentageChange:
        previous === 0
          ? current === 0
            ? 0
            : null
          : Number(((change / previous) * 100).toFixed(2)),
    };
  }
}
