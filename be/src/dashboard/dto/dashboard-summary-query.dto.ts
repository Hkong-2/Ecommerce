import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardSummaryQueryDto {
  @ApiPropertyOptional({
    description:
      'Inclusive period start as an ISO date or datetime. Defaults to 30 days before `to`.',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Exclusive period end as an ISO datetime. A date-only value includes that whole UTC day.',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description:
      'A product is low-stock when the combined stock of all its SKUs is at or below this value.',
    default: 5,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  lowStockThreshold: number = 5;
}
