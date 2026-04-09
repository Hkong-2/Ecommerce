import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

import * as path from 'path';
import { downloadImage } from './download.util';

export interface Variant {
  attributes: { storage: string; color: string };
  price: number;
  priceTextRaw: string | null;
}

export interface CrawledData {
  productName: string | null | undefined;
  sourceUrl: string;
  techSpecs: Record<string, string>;
  variants: Variant[];
  images: string[];
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(private prisma: PrismaService) {}

  async crawlCategory(
    categoryUrl: string,
    brandName: string,
    maxItems: number = 10,
    maxPages: number = 1,
  ) {
    let browser: Browser | null = null;
    try {
      this.logger.log(`Scanning category ${brandName} at ${categoryUrl}`);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
        ],
      });

      const page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (
          ['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())
        ) {
          req.abort().catch(() => {});
        } else {
          req.continue().catch(() => {});
        }
      });

      const productLinks = new Set<string>();
      let currentPage = 1;

      while (currentPage <= maxPages && productLinks.size < maxItems) {
        const urlToVisit =
          currentPage === 1
            ? categoryUrl
            : `${categoryUrl.replace(/\/$/, '')}/page/${currentPage}/`;
        this.logger.log(`Visiting page ${currentPage}: ${urlToVisit}`);

        const response = await page
          .goto(urlToVisit, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          })
          .catch(() => null);

        if (!response || !response.ok()) {
          this.logger.log(
            `Page ${currentPage} not found or error, stopping pagination.`,
          );
          break;
        }

        const linksOnPage = await page.evaluate(() => {
          const items = Array.from(
            document.querySelectorAll('.product-small, .product'),
          );
          return items
            .map((item) => {
              const a = item.querySelector('.product-title a');
              return a ? (a as HTMLAnchorElement).href : null;
            })
            .filter((href) => href !== null);
        });

        if (linksOnPage.length === 0) {
          break; // No more products
        }

        for (const link of linksOnPage) {
          if (link) productLinks.add(link);
        }
        currentPage++;
      }

      const finalLinks = Array.from(productLinks).slice(0, maxItems);

      this.logger.log(
        `Found ${finalLinks.length} product links for ${brandName}`,
      );

      const results: Array<CrawledData> = [];

      // Chạy crawl từng link
      // Để tránh nghẽn, có thể chạy vòng lặp tuần tự (hoặc song song có giới hạn)
      for (const link of productLinks) {
        try {
          // Tận dụng hàm crawl chi tiết vừa viết
          const productData = await this.crawlSonPixelProduct(link, brandName);
          results.push(productData);

          // Delay 1 chút để tránh bị block
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err) {
          this.logger.error(`Skipping ${link} due to error: ${err}`);
        }
      }

      return {
        brand: brandName,
        crawledCount: results.length,
        items: results,
      };
    } catch (error) {
      this.logger.error(`Error crawling category ${categoryUrl}: ${error}`);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  async crawlSonPixelProduct(
    url: string,
    brandName: string = 'Khác',
  ): Promise<CrawledData> {
    let browser: Browser | null = null;
    try {
      this.logger.log(`Starting to crawl Product: ${url}`);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
        ],
      });

      const page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (
          ['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())
        ) {
          req.abort().catch(() => {});
        } else {
          req.continue().catch(() => {});
        }
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // 0. Get Images
      const imageUrls = await page.evaluate(() => {
        const images: string[] = [];
        // WooCommerce single product gallery images
        const galleryItems = document.querySelectorAll(
          '.woocommerce-product-gallery__image a',
        );
        galleryItems.forEach((item) => {
          const href = (item as HTMLAnchorElement).href;
          if (href && !images.includes(href)) {
            images.push(href);
          }
        });

        // Fallback: If no gallery, find the main image
        if (images.length === 0) {
          const mainImage = document.querySelector(
            '.woocommerce-main-image, .wp-post-image',
          );
          if (mainImage) {
            const src =
              mainImage.getAttribute('src') ||
              mainImage.getAttribute('data-src');
            if (src) images.push(src);
          }
        }
        return images;
      });

      this.logger.log(`Found ${imageUrls.length} images for ${url}`);

      // 1. Get Product Name
      const productName = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.product-title, h1');
        return titleEl ? titleEl.textContent?.trim() : null;
      });

      if (!productName) {
        throw new Error('Could not find product name on the page.');
      }

      // 2. Get Tech Specs from the second table (as seen in screenshot)
      const techSpecs = await page.evaluate(() => {
        const specs: Record<string, string> = {};
        const tables = document.querySelectorAll('table');

        // Find the right table. Usually the first table is variations (if any), the second is specs.
        // Let's just find the table that has 'Kích thước màn hình' or similar keys.
        let targetTable: HTMLTableElement | null = null;
        for (const table of tables) {
          if (
            table.textContent?.includes('màn hình') ||
            table.textContent?.includes('Camera') ||
            table.textContent?.includes('Pin')
          ) {
            targetTable = table;
            // Prefer a table that does NOT have variation selectors like 'Chọn một tùy chọn'
            if (!table.textContent?.includes('Chọn một tùy chọn')) {
              break;
            }
          }
        }

        if (targetTable) {
          const rows = targetTable.querySelectorAll('tr');
          rows.forEach((row) => {
            const th = row.querySelector('th, td:first-child');
            const td = row.querySelectorAll('td');
            // Sometimes format is th - td, sometimes td - td
            const valCell = td.length > 1 ? td[1] : td[0];

            if (th && valCell && th !== valCell) {
              const key = th.textContent?.trim() || '';
              const val =
                valCell.textContent?.trim().replace(/\s+/g, ' ') || '';
              if (
                key &&
                val &&
                !key.includes('Chọn một tùy chọn') &&
                !val.includes('Chọn một tùy chọn')
              ) {
                specs[key] = val;
              }
            }
          });
        }
        return specs;
      });

      // 3. Get Variants from data-product_variations JSON
      const variantsData = await page.evaluate(() => {
        const form = document.querySelector('.variations_form');
        if (!form) return null;

        const dataAttr = form.getAttribute('data-product_variations');
        if (!dataAttr) return null;

        try {
          return JSON.parse(dataAttr);
        } catch (e) {
          return null;
        }
      });

      const variants: Variant[] = [];

      if (
        variantsData &&
        Array.isArray(variantsData) &&
        variantsData.length > 0
      ) {
        for (const v of variantsData) {
          const attrs: Record<string, string> = {};

          // Map woocommerce attributes
          // example: "attribute_pa_mau-sac": "trang-su", "attribute_pa_bo-nho-trong": "128gb", "attribute_pa_option": "new-seal"
          for (const [key, value] of Object.entries(v.attributes || {})) {
            let niceKey = key
              .replace('attribute_pa_', '')
              .replace('attribute_', '');
            if (niceKey === 'mau-sac') niceKey = 'color';
            if (niceKey === 'bo-nho-trong') niceKey = 'storage';
            if (niceKey === 'option') niceKey = 'condition';

            attrs[niceKey] = (value as string).replace(/-/g, ' ');
          }

          // Ensure color and storage exist for backward compatibility with schema
          if (!attrs.color) attrs.color = 'Mặc định';
          if (!attrs.storage) attrs.storage = 'Mặc định';

          variants.push({
            attributes: attrs as any,
            price: v.display_price || 0,
            priceTextRaw: v.display_price ? v.display_price.toString() : null,
          });
        }
      } else {
        // Fallback for simple products
        const simplePrice = await page.evaluate(() => {
          const priceEl = document.querySelector(
            '.price .woocommerce-Price-amount bdi',
          );
          if (!priceEl) return 0;
          const text = priceEl.textContent?.replace(/[^0-9]/g, '') || '';
          return parseInt(text, 10) || 0;
        });

        variants.push({
          attributes: { storage: 'Mặc định', color: 'Mặc định' },
          price: simplePrice,
          priceTextRaw: simplePrice.toString(),
        });
      }

      this.logger.log(
        `Crawl done for ${productName}. Found ${variants.length} variants.`,
      );

      // Lưu vào Database
      if (productName) {
        await this.saveToDatabase(
          {
            productName,
            sourceUrl: url,
            techSpecs,
            variants,
            images: imageUrls,
          },
          brandName,
        );
      }

      return {
        productName,
        sourceUrl: url,
        techSpecs,
        variants,
        images: imageUrls,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error crawling ${url}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Error crawling ${url}: ${String(error)}`);
      }
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async saveToDatabase(
    data: {
      productName: string;
      sourceUrl: string;
      techSpecs: Record<string, string>;
      variants: Variant[];
      images: string[];
    },
    brandName: string = 'Khác',
  ) {
    this.logger.log(`Saving ${data.productName} to database...`);

    // 1. Tìm Category và Brand
    let category = await this.prisma.category.findFirst({
      where: { name: 'Điện thoại' },
    });
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'Điện thoại', slug: 'dien-thoai' },
      });
    }

    const brandSlug = brandName
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
    let brand = await this.prisma.brand.findFirst({
      where: { name: brandName },
    });
    if (!brand) {
      brand = await this.prisma.brand.create({
        data: { name: brandName, slug: brandSlug },
      });
    }

    // 2. Download Images
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const localImageUrls: string[] = [];

    for (const url of data.images) {
      const filename = await downloadImage(url, uploadDir);
      if (filename) {
        localImageUrls.push(`/uploads/products/${filename}`);
      }
    }

    const thumbnailUrl = localImageUrls.length > 0 ? localImageUrls[0] : null;

    // 3. Upsert Product
    const slug = data.productName
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const product = await this.prisma.product.upsert({
      where: { slug: slug },
      update: {
        sourceUrl: data.sourceUrl,
        techSpecs: data.techSpecs,
        thumbnailUrl: thumbnailUrl || undefined,
        // Cập nhật updatedAt tự động do prisma xử lý @updatedAt
      },
      create: {
        name: data.productName,
        slug: slug,
        description: data.productName, // Tạm dùng tên làm mô tả
        sourceUrl: data.sourceUrl,
        techSpecs: data.techSpecs,
        thumbnailUrl: thumbnailUrl,
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    // 4. Update Product Images
    // Remove old images physically and in db before adding new ones
    const oldImages = await this.prisma.productImage.findMany({
      where: { productId: product.id }
    });

    for (const oldImg of oldImages) {
      if (oldImg.imageUrl.startsWith('/uploads/products/')) {
        const filePath = path.join(process.cwd(), 'public', oldImg.imageUrl);
        try {
          if (require('fs').existsSync(filePath)) {
            require('fs').unlinkSync(filePath);
          }
        } catch (err) {
          this.logger.error(`Error deleting old image ${filePath}: ${err}`);
        }
      }
    }

    await this.prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    if (localImageUrls.length > 0) {
      const imageRecords = localImageUrls.map((url) => ({
        productId: product.id,
        imageUrl: url,
        altText: data.productName,
      }));
      await this.prisma.productImage.createMany({
        data: imageRecords,
      });
    }

    // 5. Upsert SKUs
    for (const variant of data.variants) {
      if (!variant.attributes.storage || !variant.attributes.color) continue;

      const skuCode =
        `${slug}-${variant.attributes.storage}-${variant.attributes.color}`
          .replace(/ /g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .toUpperCase();

      await this.prisma.sKU.upsert({
        where: { skuCode: skuCode },
        update: {
          price: variant.price || 0,
          attributes: variant.attributes as object,
          stock: 100, // Tạm gán tồn kho mặc định
        },
        create: {
          productId: product.id,
          skuCode: skuCode,
          price: variant.price || 0,
          attributes: variant.attributes as object,
          stock: 100,
        },
      });
    }

    this.logger.log(`Saved successfully!`);
  }
}
