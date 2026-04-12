import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CrawlerModule } from './crawler/crawler.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường sử dụng ở toàn bộ module
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'), // Fix for dist/src/app.module.js -> ../../public
      serveRoot: '/', // Optional, default is '/'
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CrawlerModule,
    ProductsModule,
    BrandsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
