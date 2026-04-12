import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { cartItemIds, addressId, paymentMethod, note } = createOrderDto;

    // Validate if the address belongs to the user
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Delivery address not found');
    }

    // Process transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch CartItems and related SKUs/Products
      const cartItems = await tx.cartItem.findMany({
        where: {
          id: { in: cartItemIds },
          userId,
        },
        include: {
          sku: {
            include: {
              product: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('No items found to checkout');
      }

      if (cartItems.length !== cartItemIds.length) {
        throw new BadRequestException(
          'Some cart items are invalid or do not belong to you',
        );
      }

      // 2. Validate stock and prepare order items data
      let totalAmount = 0;
      const orderItemsData: any[] = [];

      for (const item of cartItems) {
        if (item.sku.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.sku.product.name} (SKU: ${item.sku.skuCode})`,
          );
        }

        const unitPrice = item.sku.originalPrice || item.sku.price;
        const discountAmount = item.sku.originalPrice
          ? item.sku.originalPrice - item.sku.price
          : 0;
        const finalPrice = item.sku.price;

        totalAmount += finalPrice * item.quantity;

        orderItemsData.push({
          skuId: item.skuId,
          quantity: item.quantity,
          productNameSnapshot: item.sku.product.name,
          skuAttributesSnapshot: item.sku.attributes,
          unitPrice,
          discountAmount,
          finalPrice,
        });

        // 3. Deduct stock
        await tx.sKU.update({
          where: { id: item.skuId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Calculate Shipping Fee
      let shippingFee = 40000; // Default fee

      // Free shipping for orders over 10 million VND
      if (totalAmount >= 10000000) {
        shippingFee = 0;
      } else if (
        address.city.includes('Hà Nội') ||
        address.city.includes('Hồ Chí Minh')
      ) {
        shippingFee = 20000;
      }

      const finalTotalAmount = totalAmount + shippingFee;

      // Generate short order code
      const orderCode = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          orderCode,
          paymentMethod,
          shippingFee,
          totalAmount: finalTotalAmount,
          note,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: [
              {
                status: 'PENDING',
                note: 'Order placed',
              },
            ],
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      // 6. Delete Cart Items
      await tx.cartItem.deleteMany({
        where: {
          id: { in: cartItemIds },
        },
      });

      return order;
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });
  }

  async findOne(userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            sku: {
              include: {
                product: {
                  select: {
                    slug: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
