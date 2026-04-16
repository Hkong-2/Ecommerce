import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  createPaymentUrl(
    order: { orderCode: string; totalAmount: number; [key: string]: any },
    ipAddr: string,
  ): string {
    const tmnCode = this.configService.get<string>('VNP_TMN_CODE');
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
    let vnpUrl = this.configService.get<string>('VNP_URL');
    const returnUrl = this.configService.get<string>('VNP_RETURN_URL');

    const date = new Date();
    const createDate = this.formatDate(date);

    // Set expire date to 15 mins later
    const expireDateObj = new Date(date.getTime() + 15 * 60 * 1000);
    const expireDate = this.formatDate(expireDateObj);

    let vnp_Params: Record<string, string | number> = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode || '';
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = order.orderCode;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + order.orderCode;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = order.totalAmount * 100; // VNPay require amount * 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl || '';
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    vnp_Params = this.sortObject(vnp_Params as Record<string, string>);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey || '');
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return vnpUrl || '';
  }

  async handleVnpayReturn(vnpParams: Record<string, string>) {
    let vnp_Params: Record<string, string> = { ...vnpParams };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET');

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey || '');
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderCode = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    if (secureHash === signed) {
      // Payment successful
      if (rspCode === '00') {
        // Update order status to PAID
        await this.prisma.order.update({
          where: { orderCode: orderCode },
          data: {
            paymentStatus: 'PAID',
            statusHistory: {
              create: {
                status: 'PROCESSING',
                note: 'Thanh toán VNPay thành công. Chuyển sang đóng gói.',
              },
            },
          },
        });
        return {
          isSuccess: true,
          orderCode,
          transactionNo: vnp_Params['vnp_TransactionNo'],
        };
      } else {
        // Payment failed
        await this.prisma.order.update({
          where: { orderCode: orderCode },
          data: {
            paymentStatus: 'FAILED',
            statusHistory: {
              create: {
                status: 'CANCELLED',
                note: 'Giao dịch thanh toán VNPay thất bại hoặc bị hủy.',
              },
            },
          },
        });
        return { isSuccess: false, orderCode };
      }
    } else {
      // Invalid checksum
      return { isSuccess: false, orderCode };
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (const key of str) {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
