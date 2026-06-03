import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({ description: 'GHN province ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({ description: 'GHN district ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ description: 'GHN ward code' })
  @IsOptional()
  @IsString()
  wardCode?: string;

  @ApiPropertyOptional({ description: 'Is this the default address?' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
