import { Controller, Get } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from '@prisma/client';

@Controller('api/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async getAllBrands(): Promise<Brand[]> {
    return this.brandsService.getAllBrands();
  }
}
