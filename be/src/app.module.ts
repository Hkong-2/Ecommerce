import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường sử dụng ở toàn bộ module
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CrawlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
