import { Controller, Post, Body } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('mobilecity')
  async crawlMobileCity(@Body('url') url: string) {
    if (!url) {
      return { success: false, message: 'URL is required' };
    }
    const result = await this.crawlerService.crawlMobileCityProduct(url);
    return { success: true, data: result };
  }
}
