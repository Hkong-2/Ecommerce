import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('shipping-fee')
  @ApiOperation({ summary: 'Calculate shipping fee via GHN' })
  async calculateShippingFee(
    @Body() body: { districtId: number; wardCode: string },
  ) {
    return this.ordersService.calculateShippingFee(
      body.districtId,
      body.wardCode,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @Body() body: { addressId: number; paymentMethod: string },
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    // Log addressId and userId for debugging
    console.log(
      `Creating order for userId: ${userId}, addressId: ${body.addressId}`,
    );
    return this.ordersService.createOrder(
      userId,
      Number(body.addressId),
      body.paymentMethod,
    );
  }
}
