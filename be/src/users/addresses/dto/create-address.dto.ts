import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Name of the receiver' })
  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @ApiProperty({ description: 'Phone number of the receiver' })
  @IsNotEmpty()
  @IsString()
  receiverPhone: string;

  @ApiProperty({ description: 'Street address / House number' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'Ward' })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({ description: 'District' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ description: 'City / Province' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Is this the default address?' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
