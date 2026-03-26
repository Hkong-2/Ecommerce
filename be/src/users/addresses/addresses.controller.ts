import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('user-addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new address for current user' })
  @ApiResponse({ status: 201, description: 'Address successfully created.' })
  create(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(req.user.userId, createAddressDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address for current user' })
  @ApiResponse({ status: 200, description: 'Address successfully updated.' })
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.userId, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address for current user' })
  @ApiResponse({ status: 200, description: 'Address successfully deleted.' })
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(req.user.userId, id);
  }
}
