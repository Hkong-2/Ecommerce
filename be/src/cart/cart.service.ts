import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách giỏ hàng của user
  async getCart(userId: number) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        sku: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            images: true, // Lấy ảnh của SKU nếu có
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    // Format lại response cho thân thiện với frontend
    return cartItems.map((item) => {
      // Tìm ảnh đại diện hợp lý nhất: Ảnh của SKU -> hoặc ảnh chính của Product
      const imageUrl =
        item.sku.images.length > 0
          ? item.sku.images[0].imageUrl
          : item.sku.product.thumbnailUrl;

      return {
        id: item.id,
        skuId: item.skuId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        sku: {
          id: item.sku.id,
          skuCode: item.sku.skuCode,
          price: item.sku.price,
          originalPrice: item.sku.originalPrice,
          attributes: item.sku.attributes,
          stock: item.sku.stock,
        },
        product: {
          id: item.sku.product.id,
          name: item.sku.product.name,
          slug: item.sku.product.slug,
          brandName: item.sku.product.brand.name,
          thumbnailUrl: imageUrl,
        },
      };
    });
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: number, dto: AddToCartDto) {
    const { skuId, quantity } = dto;

    // 1. Kiểm tra SKU có tồn tại và lấy stock
    const sku = await this.prisma.sKU.findUnique({
      where: { id: skuId },
      include: { product: true },
    });

    if (!sku) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    if (!sku.product.isActive) {
      throw new BadRequestException('Sản phẩm này đã ngừng kinh doanh');
    }

    // 2. Tìm xem item đã có trong giỏ chưa
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_skuId: { userId, skuId },
      },
    });

    // 3. Tính toán tổng số lượng muốn thêm và kiểm tra stock
    const newTotalQuantity = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    if (newTotalQuantity > sku.stock) {
      throw new BadRequestException(`Chỉ còn ${sku.stock} sản phẩm trong kho`);
    }

    // 4. Lưu vào db (Update hoặc Create)
    if (existingCartItem) {
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newTotalQuantity },
      });
    } else {
      return this.prisma.cartItem.create({
        data: {
          userId,
          skuId,
          quantity,
        },
      });
    }
  }

  // Cập nhật số lượng của 1 item trong giỏ
  async updateCartItem(userId: number, skuId: number, dto: UpdateCartItemDto) {
    const { quantity } = dto;

    // Lấy cart item
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { userId_skuId: { userId, skuId } },
      include: { sku: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    // Kiểm tra stock
    if (quantity > cartItem.sku.stock) {
      throw new BadRequestException(
        `Chỉ còn ${cartItem.sku.stock} sản phẩm trong kho`,
      );
    }

    // Cập nhật số lượng
    return this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  // Xóa 1 item khỏi giỏ
  async removeCartItem(userId: number, skuId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { userId_skuId: { userId, skuId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
  }

  // Xóa toàn bộ giỏ hàng của user
  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Đã làm trống giỏ hàng' };
  }
}
