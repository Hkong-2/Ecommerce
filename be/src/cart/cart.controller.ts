import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth() // Require Bearer token for all endpoints
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Lấy danh sách giỏ hàng của user hiện tại' })
  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @Post()
  addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ' })
  @Patch(':skuId')
  updateCartItem(
    @Request() req: any,
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.userId,
      skuId,
      updateCartItemDto,
    );
  }

  @ApiOperation({ summary: 'Xóa một sản phẩm khỏi giỏ' })
  @Delete(':skuId')
  removeCartItem(
    @Request() req: any,
    @Param('skuId', ParseIntPipe) skuId: number,
  ) {
    return this.cartService.removeCartItem(req.user.userId, skuId);
  }

  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
