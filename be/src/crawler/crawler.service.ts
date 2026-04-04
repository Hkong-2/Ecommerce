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

  async crawlMobileCityProduct(url: string): Promise<{
    productName: string | null | undefined;
    sourceUrl: string;
    techSpecs: Record<string, string>;
    variants: Variant[];
  }> {
    let browser: Browser | null = null;
    try {
      this.logger.log(`Starting to crawl: ${url}`);

      // Khởi tạo trình duyệt
      browser = await puppeteer.launch({
        headless: true, // Chạy ẩn
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Tối ưu cho server
      });

      const page = await browser.newPage();

      // Tối ưu: Block images và stylesheets để load nhanh hơn
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (
          req.resourceType() == 'stylesheet' ||
          req.resourceType() == 'font' ||
          req.resourceType() == 'image'
        ) {
          req
            .abort()
            .catch((e) => this.logger.warn(`Abort request failed: ${e}`));
        } else {
          req
            .continue()
            .catch((e) => this.logger.warn(`Continue request failed: ${e}`));
        }
      });

      // Điều hướng đến trang
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Lấy tên sản phẩm (Ví dụ selector cơ bản, có thể cần điều chỉnh sau khi chạy thực tế)
      const productName = await page.evaluate(() => {
        const titleEl =
          document.querySelector('h1.name-product') ||
          document.querySelector('h1');
        return titleEl ? titleEl.textContent?.trim() : null;
      });

      // Bóc tách thông số kỹ thuật (Dựa theo ảnh cung cấp)
      const techSpecs = await page.evaluate(() => {
        const specs: Record<string, string> = {};
        // Thông thường MobileCity có bảng với class 'table-tskt' hoặc tương tự
        const rows = document.querySelectorAll(
          '.table-tskt tr, .thong-so-ky-thuat tr, table tr',
        );

        rows.forEach((row) => {
          const keyEl = row.querySelector('th, td:first-child');
          const valEl = row.querySelector('td:last-child');

          if (keyEl && valEl) {
            const key = keyEl.textContent?.trim().replace(':', '') || '';
            const val = valEl.textContent?.trim() || '';
            if (key && val && key !== val) {
              specs[key] = val;
            }
          }
        });
        return specs;
      });

      // Lấy danh sách các nút dung lượng (Storage)
      const storageOptions = await page.evaluate(() => {
        // Cần sửa selector này dựa trên HTML thực tế của MobileCity
        const buttons = Array.from(
          document.querySelectorAll(
            '.box-memory .item, .capacity-list .item, .version-list .item',
          ),
        );
        return buttons.map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || '',
        }));
      });

      // Lấy danh sách các nút màu sắc (Color)
      const colorOptions = await page.evaluate(() => {
        // Cần sửa selector này dựa trên HTML thực tế của MobileCity
        const buttons = Array.from(
          document.querySelectorAll('.box-color .item, .color-list .item'),
        );
        return buttons.map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || '',
        }));
      });

      const variants: Variant[] = [];

      // Loop qua từng dung lượng
      for (const storage of storageOptions) {
        if (!storage.text) continue;

        // Click vào dung lượng
        await page.evaluate((idx) => {
          const buttons = document.querySelectorAll(
            '.box-memory .item, .capacity-list .item, .version-list .item',
          );
          if (buttons[idx]) buttons[idx].click();
        }, storage.index);

        // Đợi một chút cho giá update (JS)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Loop qua từng màu
        for (const color of colorOptions) {
          if (!color.text) continue;

          // Click vào màu sắc
          await page.evaluate((idx) => {
            const buttons = document.querySelectorAll(
              '.box-color .item, .color-list .item',
            );
            if (buttons[idx]) buttons[idx].click();
          }, color.index);

          // Đợi JS update giá
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Lấy giá hiện tại đang hiển thị
          const priceText = await page.evaluate(() => {
            // Selector giá (Cần điều chỉnh)
            const priceEl = document.querySelector(
              '.price-current, .price .current, .price-buy',
            );
            return priceEl ? priceEl.textContent?.trim() : null;
          });

          // Parse giá về số (Ví dụ: "10.000.000 ₫" -> 10000000)
          let price = 0;
          if (priceText) {
            const numericString = priceText.replace(/[^0-9]/g, '');
            price = parseInt(numericString, 10);
          }

          variants.push({
            attributes: {
              storage: storage.text,
              color: color.text,
            },
            price: price,
            priceTextRaw: priceText,
          });
        }
      }

      this.logger.log(
        `Crawl done for ${productName}. Found ${variants.length} variants.`,
      );

      // Lưu vào Database
      if (productName) {
        await this.saveToDatabase({
          productName,
          sourceUrl: url,
          techSpecs,
          variants,
        });
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

  private async saveToDatabase(data: {
    productName: string;
    sourceUrl: string;
    techSpecs: Record<string, string>;
    variants: Variant[];
  }) {
    this.logger.log(`Saving ${data.productName} to database...`);

    // 1. Tìm Category và Brand (Tạo mặc định nếu chưa có)
    // Trong thực tế, bạn có thể muốn crawl luôn category/brand từ breadcrumb, ở đây ta gán cứng để test
    let category = await this.prisma.category.findFirst({
      where: { name: 'Điện thoại' },
    });
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'Điện thoại', slug: 'dien-thoai' },
      });
    }

    let brand = await this.prisma.brand.findFirst({ where: { name: 'Khác' } });
    if (!brand) {
      brand = await this.prisma.brand.create({
        data: { name: 'Khác', slug: 'khac' },
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
