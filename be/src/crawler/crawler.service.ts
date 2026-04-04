import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

export interface Variant {
  attributes: { storage: string; color: string };
  price: number;
  priceTextRaw: string | null;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(private prisma: PrismaService) {}

  async crawlCategory(
    categoryUrl: string,
    brandName: string,
    maxItems: number = 20,
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

      await page.goto(categoryUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Lấy danh sách link sản phẩm từ trang danh mục Hoàng Hà
      const productLinks = await page.evaluate((max) => {
        // Hoàng Hà thường bọc item trong .item hoặc các class tương tự.
        const links = Array.from(
          document.querySelectorAll(
            '.list-product .item a, .col-content a.pic, .product-item a.img',
          ),
        );

        const validUrls = new Set<string>();
        links.forEach((a) => {
          const href = (a as HTMLAnchorElement).href;
          // Lọc bỏ các link rác
          if (
            href &&
            href.includes('hoanghamobile.com') &&
            !href.includes('/tim-kiem') &&
            !href.includes('/tin-tuc')
          ) {
            validUrls.add(href);
          }
        });

        return Array.from(validUrls).slice(0, max);
      }, maxItems);

      this.logger.log(
        `Found ${productLinks.length} product links for ${brandName}`,
      );

      const results: Array<{
        productName: string | null | undefined;
        sourceUrl: string;
        techSpecs: Record<string, string>;
        variants: Variant[];
      }> = [];

      // Chạy crawl từng link
      // Để tránh nghẽn, có thể chạy vòng lặp tuần tự (hoặc song song có giới hạn)
      for (const link of productLinks) {
        try {
          // Tận dụng hàm crawl chi tiết vừa viết
          const productData = await this.crawlHoangHaProduct(link, brandName);
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

  async crawlHoangHaProduct(
    url: string,
    brandName: string = 'Khác',
  ): Promise<{
    productName: string | null | undefined;
    sourceUrl: string;
    techSpecs: Record<string, string>;
    variants: Variant[];
  }> {
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

      // Tối ưu tốc độ: chặn tải tài nguyên không cần thiết
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

      // Navigate to the product page
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // 1. Lấy Tên Sản Phẩm (Từ H1)
      const productNameRaw = await page.evaluate(() => {
        const titleEl = document.querySelector('h1');
        return titleEl ? titleEl.textContent?.trim() : null;
      });

      if (!productNameRaw) {
        throw new Error('Could not find product name on the page.');
      }

      // Tách tên máy và dung lượng từ tên trên Web Hoàng Hà (ví dụ: "Samsung Galaxy S24 Ultra - 256GB - Chính hãng")
      const productName = productNameRaw.split('-')[0].trim();
      let storageFromTitle = 'Default';
      const parts = productNameRaw.split('-');
      if (parts.length > 1) {
        // Đoán dung lượng nằm ở phần thứ 2
        const possibleStorage = parts[1].trim();
        if (possibleStorage.includes('GB') || possibleStorage.includes('TB')) {
          storageFromTitle = possibleStorage;
        }
      }

      // 2. Lấy Thông số kỹ thuật
      const techSpecs = await page.evaluate(() => {
        const specs: Record<string, string> = {};
        // Hoàng Hà Mobile lưu thông số trong các class specs-special hoặc table. Mò từ body content
        const rows = document.querySelectorAll(
          '.specs-special li, .specs-special p, table tr',
        );

        rows.forEach((row) => {
          const text = row.textContent?.trim() || '';
          if (text.includes(':')) {
            const parts = text.split(':');
            if (parts.length >= 2) {
              specs[parts[0].trim()] = parts.slice(1).join(':').trim();
            }
          } else {
            // Table layout (th, td)
            const keyEl = row.querySelector('td:first-child, th');
            const valEl = row.querySelector('td:last-child');
            if (keyEl && valEl && keyEl !== valEl) {
              const key = keyEl.textContent?.trim().replace(':', '') || '';
              const val = valEl.textContent?.trim() || '';
              if (key && val) specs[key] = val;
            }
          }
        });
        return specs;
      });

      // 3. Lấy Màu sắc và Giá
      // Vì Hoàng Hà Mobile render sẵn các ô màu trong HTML (class .color-options hoặc danh sách các label)
      const variantsData = await page.evaluate(() => {
        const results: Array<{ color: string; priceText: string }> = [];

        // Tìm các option màu (Thường là các thẻ <a> hoặc <label> trong khối .product-option)
        const colorElements = document.querySelectorAll(
          '.product-option .color-options .item, .product-option label.color',
        );

        colorElements.forEach((el) => {
          // Lấy tên màu (thường nằm trong thẻ span, strong hoặc text trực tiếp)
          const colorNameEl = el.querySelector('strong, span.name, div.title');
          const color = colorNameEl
            ? colorNameEl.textContent?.trim()
            : el.textContent?.trim().split('\n')[0].trim() || '';

          // Lấy giá (thường nằm cạnh màu)
          const priceEl = el.querySelector('span.price, div.price');
          const priceText = priceEl ? priceEl.textContent?.trim() : null;

          if (color) {
            results.push({
              color: color,
              priceText: priceText || '',
            });
          }
        });

        // Fallback nếu DOM thay đổi: tìm price chính đang active
        if (results.length === 0) {
          const activePriceEl = document.querySelector(
            '.price-current, .price strong, .product-price strong',
          );
          results.push({
            color: 'Mặc định',
            priceText: activePriceEl
              ? activePriceEl.textContent?.trim() || ''
              : '',
          });
        }

        return results;
      });

      const variants: Variant[] = [];
      for (const v of variantsData) {
        let price = 0;
        if (v.priceText) {
          const numericString = v.priceText.replace(/[^0-9]/g, '');
          if (numericString) {
            price = parseInt(numericString, 10);
          }
        }

        variants.push({
          attributes: {
            storage: storageFromTitle,
            color: v.color || 'Mặc định',
          },
          price: price,
          priceTextRaw: v.priceText || null,
        });
      }

      this.logger.log(
        `Crawl done for ${productName} (${storageFromTitle}). Found ${variants.length} color variants.`,
      );

      // Lưu vào Database
      if (productName) {
        await this.saveToDatabase(
          { productName, sourceUrl: url, techSpecs, variants },
          brandName,
        );
      }

      return {
        productName,
        sourceUrl: url,
        techSpecs,
        variants,
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

    // 2. Upsert Product
    const slug = data.productName
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const product = await this.prisma.product.upsert({
      where: { slug: slug },
      update: {
        sourceUrl: data.sourceUrl,
        techSpecs: data.techSpecs,
        // Cập nhật updatedAt tự động do prisma xử lý @updatedAt
      },
      create: {
        name: data.productName,
        slug: slug,
        description: data.productName, // Tạm dùng tên làm mô tả
        sourceUrl: data.sourceUrl,
        techSpecs: data.techSpecs,
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    // 3. Upsert SKUs
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
