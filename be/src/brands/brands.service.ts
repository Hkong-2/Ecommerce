import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBrands(): Promise<Brand[]> {
    try {
      return await this.prisma.brand.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
