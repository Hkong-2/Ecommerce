import { Controller, Get, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('vnpay-return')
  async vnpayReturn(@Req() req: Request) {
    // VNPay returns data through GET params, Frontend will pass them here
    const vnp_Params = req.query as Record<string, string>;
    const result = await this.paymentService.handleVnpayReturn(vnp_Params);
    return result;
  }
}
