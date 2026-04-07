import { Controller, Post, Body } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('sonpixel/product')
  async crawlSonPixelProduct(
    @Body('url') url: string,
    @Body('brand') brand: string,
  ) {
    if (!url) {
      return { success: false, message: 'URL is required' };
    }
    const result = await this.crawlerService.crawlSonPixelProduct(url, brand);
    return { success: true, data: result };
  }

  @Post('sonpixel/category')
  async crawlSonPixelCategory(
    @Body('url') url: string,
    @Body('brand') brand: string,
    @Body('maxItems') maxItems: number,
    @Body('maxPages') maxPages: number,
  ) {
    if (!url || !brand) {
      return { success: false, message: 'URL and Brand are required' };
    }
    const result = await this.crawlerService.crawlCategory(
      url,
      brand,
      maxItems || 20,
      maxPages || 3,
    );
    return { success: true, data: result };
  }
}
