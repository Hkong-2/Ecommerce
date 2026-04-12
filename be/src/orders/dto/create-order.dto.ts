import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of cart item IDs to checkout',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  cartItemIds: number[];

  @ApiProperty({ description: 'ID of the delivery address' })
  @IsInt()
  @IsNotEmpty()
  addressId: number;

  @ApiProperty({ description: 'Payment method (e.g., COD, VNPAY)' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ description: 'Optional note for the order', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
