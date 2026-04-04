import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AddressesController } from './addresses/addresses.controller';
import { AddressesService } from './addresses/addresses.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, AddressesService],
  controllers: [UsersController, AddressesController],
})
export class UsersModule {}
