import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async calculateShippingFee(districtId: number, wardCode: string) {
    try {
      const ghnUrl = this.configService.get<string>('GHN_API_URL');
      const token = this.configService.get<string>('GHN_API_TOKEN');
      const shopId = this.configService.get<number>('GHN_SHOP_ID');
      const fromDistrictId = this.configService.get<number>(
        'GHN_FROM_DISTRICT_ID',
      );

      if (!ghnUrl || !token || !shopId) {
        // Fallback if GHN env not set
        return { fee: 30000 };
      }

      const payload = {
        service_id: 53320, // Default GHN service ID
        insurance_value: 500000,
        coupon: null,
        from_district_id: Number(fromDistrictId),
        to_district_id: districtId,
        to_ward_code: wardCode,
        weight: 1000, // Default 1kg
        length: 20,
        width: 20,
        height: 10,
      };

      const response = await firstValueFrom(
        this.httpService.post<{ data: { total: number } }>(ghnUrl, payload, {
          headers: {
            token: token,
            ShopId: shopId,
          },
        }),
      );

      return { fee: response.data?.data?.total || 30000 };
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error(
        'GHN Shipping Fee Error:',
        err.response?.data || err.message,
      );
      // Fallback in case GHN API fails
      return { fee: 35000 };
    }
  }

  async createOrder(userId: number, addressId: number, paymentMethod: string) {
    // 1. Get user's cart
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        sku: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    // 2. Check address
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new BadRequestException(
        `Không tìm thấy địa chỉ có ID = ${addressId}`,
      );
    }

    if (address.userId !== userId) {
      throw new BadRequestException(
        `Địa chỉ ${addressId} không thuộc về User ${userId}`,
      );
    }

    // 3. Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.sku.price * item.quantity;
    }

    // Mock districtId / wardCode if not exist in model Address
    const mockedDistrictId = 1442;
    const mockedWardCode = '20104';

    // Call GHN shipping fee
    const { fee: shippingFee } = await this.calculateShippingFee(
      mockedDistrictId,
      mockedWardCode,
    );

    const finalShippingFee = subtotal > 15000000 ? 0 : shippingFee;
    const totalAmount = subtotal + finalShippingFee;

    // 4. Generate Order Code
    const orderCode = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Create Order in Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          orderCode,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: 'UNPAID',
          shippingFee: finalShippingFee,
          totalAmount,
          items: {
            create: cartItems.map((item) => ({
              skuId: item.skuId,
              quantity: item.quantity,
              productNameSnapshot: item.sku.product.name,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              skuAttributesSnapshot: item.sku.attributes
                ? (item.sku.attributes as any)
                : undefined,
              unitPrice: item.sku.price,
              finalPrice: item.sku.price,
              discountAmount: 0,
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Đơn hàng được tạo',
            },
          },
        },
      });

      // (Tùy chọn) Không xóa giỏ hàng ở đây vì logic mới là giữ lại sản phẩm.
      // await tx.cartItem.deleteMany({
      //   where: { userId },
      // });

      return newOrder;
    });

    // 6. Handle Payment Method
    if (paymentMethod === 'VNPAY') {
      const paymentUrl = this.paymentService.createPaymentUrl(
        order,
        '127.0.0.1',
      );
      return { order, paymentUrl };
    }

    return { order, paymentUrl: null };
  }
}
