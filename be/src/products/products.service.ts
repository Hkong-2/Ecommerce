import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepageProducts() {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
        },
        take: 6,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          skus: {
            select: {
              price: true,
            },
          },
        },
      });

      return products.map(product => {
        // Find the minimum price among all SKUs
        const lowestPrice = product.skus.length > 0
          ? Math.min(...product.skus.map(sku => Number(sku.price)))
          : null;

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          thumbnailUrl: product.thumbnailUrl,
          brandName: product.brand.name,
          lowestPrice: lowestPrice,
        };
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to fetch homepage products');
    }
  }
}
