import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Get phase-one admin dashboard metrics' })
  @ApiResponse({
    status: 200,
    description:
      'Returns revenue, orders, customers, and current low-stock metrics.',
  })
  getSummary(@Query() query: DashboardSummaryQueryDto) {
    return this.dashboardService.getSummary(query);
  }
}
