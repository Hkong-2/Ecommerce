import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Patch('me/password')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully changed.',
  })
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.userId,
      changePasswordDto,
    );
  }
}
