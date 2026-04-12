import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'ID của SKU (Biến thể sản phẩm)', example: 1 })
  @IsInt()
  @IsNotEmpty()
  skuId: number;

  @ApiProperty({ description: 'Số lượng muốn thêm', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
