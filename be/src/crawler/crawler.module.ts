import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Assume PrismaModule is globally available or correctly path'ed

@Module({
  imports: [PrismaModule], // We need Prisma to save data
  providers: [CrawlerService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
