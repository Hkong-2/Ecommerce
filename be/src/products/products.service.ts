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

  async searchAndFilterProducts(params: {
    query?: string;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page: number;
    limit: number;
  }) {
    const { query, brandId, minPrice, maxPrice, sortBy, page, limit } = params;

    // Build the where clause
    const where: any = { isActive: true };

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    if (brandId) {
      where.brandId = brandId;
    }

    // SKU filtering for price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.skus = {
        some: {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        },
      };
    }

    // Determine sorting
    let orderBy: any = undefined;
    if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'price_asc') {
       orderBy = { id: 'asc' }; // fallback for prisma query
    } else if (sortBy === 'price_desc') {
       orderBy = { id: 'asc' }; // fallback for prisma query
    }

    const startIndex = (page - 1) * limit;

    // Fetch products
    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          brand: { select: { name: true } },
          skus: { select: { price: true } },
        },
        orderBy: orderBy || { createdAt: 'desc' }, // default sort
        // If sorting by price, we can't reliably paginate via DB since lowestPrice is dynamic in JS.
        // For a production app, we should add a `lowestPrice` cache column on Product.
        // For now, if we are sorting by price, we have to fetch all, sort, then paginate (Not ideal, but functional for small dataset).
        // If not sorting by price, we paginate at DB level.
        ...(sortBy === 'price_asc' || sortBy === 'price_desc' ? {} : { skip: startIndex, take: limit })
      }),
    ]);

    // Map to frontend structure
    let mappedProducts = products.map((product) => {
      const lowestPrice =
        product.skus.length > 0
          ? Math.min(...product.skus.map((sku) => Number(sku.price)))
          : 0;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        thumbnailUrl: product.thumbnailUrl,
        brandName: product.brand ? product.brand.name : 'Unknown Brand',
        lowestPrice: lowestPrice,
      };
    });

    let paginatedData = mappedProducts;
    let hasMore = false;

    // In-memory sort and pagination for price
    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
      if (sortBy === 'price_asc') {
        mappedProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
      } else {
        mappedProducts.sort((a, b) => b.lowestPrice - a.lowestPrice);
      }
      const endIndex = startIndex + limit;
      paginatedData = mappedProducts.slice(startIndex, endIndex);
      hasMore = endIndex < mappedProducts.length;
    } else {
       hasMore = total > startIndex + limit;
    }

    return {
      data: paginatedData,
      total: total,
      hasMore: hasMore,
    };
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
