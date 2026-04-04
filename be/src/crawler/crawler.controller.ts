import { Controller, Post, Body } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('hoangha/product')
  async crawlHoangHaProduct(
    @Body('url') url: string,
    @Body('brand') brand: string,
  ) {
    if (!url) {
      return { success: false, message: 'URL is required' };
    }
    const result = await this.crawlerService.crawlHoangHaProduct(url, brand);
    return { success: true, data: result };
  }

  @Post('hoangha/category')
  async crawlHoangHaCategory(
    @Body('url') url: string,
    @Body('brand') brand: string,
    @Body('maxItems') maxItems: number,
  ) {
    if (!url || !brand) {
      return { success: false, message: 'URL and Brand are required' };
    }
    const result = await this.crawlerService.crawlCategory(
      url,
      brand,
      maxItems || 20,
    );
    return { success: true, data: result };
  }
}
