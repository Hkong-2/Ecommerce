import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepageProducts(page: number = 1, limit: number = 6) {
    try {
      // Get all active products with their lowest price and brand
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
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

      // Map to frontend structure
      const mappedProducts = products.map((product) => {
        const lowestPrice =
          product.skus.length > 0
            ? Math.min(...product.skus.map((sku) => Number(sku.price)))
            : 0; // fallback to 0 for sorting purposes if no sku

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          thumbnailUrl: product.thumbnailUrl,
          brandName: product.brand ? product.brand.name : 'Unknown Brand',
          lowestPrice: lowestPrice,
        };
      });

      // Group by brand
      const groupedByBrand: Record<string, typeof mappedProducts> = {};
      for (const p of mappedProducts) {
        if (!groupedByBrand[p.brandName]) {
          groupedByBrand[p.brandName] = [];
        }
        groupedByBrand[p.brandName].push(p);
      }

      // Sort products within each brand by price descending (most expensive first)
      for (const brandName in groupedByBrand) {
        groupedByBrand[brandName].sort((a, b) => b.lowestPrice - a.lowestPrice);
      }

      // Interleave products: round-robin from each brand starting from the most expensive
      const interleavedProducts: typeof mappedProducts = [];
      let added = true;
      let round = 0;

      while (added) {
        added = false;
        for (const brandName in groupedByBrand) {
          if (round < groupedByBrand[brandName].length) {
            interleavedProducts.push(groupedByBrand[brandName][round]);
            added = true;
          }
        }
        round++;
      }

      // Pagination
      const total = interleavedProducts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedData = interleavedProducts.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: total,
        hasMore: endIndex < total,
      };
    } catch (e) {
      console.error(e);
      // fallback to mock data to prevent crash if database is unavailable
      const fallbackData = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max 1TB',
          slug: 'iphone-15-pro-max-1tb',
          thumbnailUrl: null,
          brandName: 'Apple',
          lowestPrice: 46990000,
        },
        {
          id: 2,
          name: 'Samsung Galaxy Z Fold 5',
          slug: 'samsung-galaxy-z-fold-5',
          thumbnailUrl: null,
          brandName: 'Samsung',
          lowestPrice: 40990000,
        },
        {
          id: 3,
          name: 'iPhone 15 Pro Max',
          slug: 'iphone-15-pro-max',
          thumbnailUrl: null,
          brandName: 'Apple',
          lowestPrice: 29990000,
        },
        {
          id: 4,
          name: 'Samsung Galaxy S24 Ultra',
          slug: 'samsung-galaxy-s24-ultra',
          thumbnailUrl: null,
          brandName: 'Samsung',
          lowestPrice: 33990000,
        },
        {
          id: 5,
          name: 'Google Pixel 8 Pro',
          slug: 'google-pixel-8-pro',
          thumbnailUrl: null,
          brandName: 'Google',
          lowestPrice: 24990000,
        },
        {
          id: 6,
          name: 'Xiaomi 14 Ultra',
          slug: 'xiaomi-14-ultra',
          thumbnailUrl: null,
          brandName: 'Xiaomi',
          lowestPrice: 32990000,
        },
      ];

      // Sort fallback by price descending
      fallbackData.sort((a, b) => b.lowestPrice - a.lowestPrice);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = fallbackData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: fallbackData.length,
        hasMore: endIndex < fallbackData.length,
      };
    }
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        brand: true,
        category: true,
        images: true,
        skus: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
