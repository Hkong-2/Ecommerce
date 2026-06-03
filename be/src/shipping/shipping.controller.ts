import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Get GHN provinces' })
  getProvinces() {
    return this.shippingService.getProvinces();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get GHN districts by province ID' })
  getDistricts(@Query('provinceId', ParseIntPipe) provinceId: number) {
    return this.shippingService.getDistricts(provinceId);
  }

  @Get('wards')
  @ApiOperation({ summary: 'Get GHN wards by district ID' })
  getWards(@Query('districtId', ParseIntPipe) districtId: number) {
    return this.shippingService.getWards(districtId);
  }
}
