import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Số lượng mới muốn cập nhật',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
