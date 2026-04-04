import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createAddressDto: CreateAddressDto) {
    const { isDefault, ...addressData } = createAddressDto;

    // Check if user has any addresses yet
    const existingAddressesCount = await this.prisma.address.count({
      where: { userId },
    });

    // If it's their first address, force it to be default
    const makeDefault = isDefault || existingAddressesCount === 0;

    return this.prisma.$transaction(async (tx) => {
      // If setting as default, update other addresses
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...addressData,
          isDefault: makeDefault,
          user: {
            connect: { id: userId },
          },
        },
      });
    });
  }

  async update(
    userId: number,
    addressId: number,
    updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this address',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // If setting as default, update other addresses
      if (updateAddressDto.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        });
      } else if (updateAddressDto.isDefault === false && address.isDefault) {
        // Prevent unsetting the only default address, unless they set another one.
        // Or just allow it, but best practice is to always have 1 default.
        const otherAddresses = await tx.address.count({
          where: { userId, id: { not: addressId } },
        });
        if (otherAddresses > 0) {
          // Find another address and make it default
          const anotherAddress = await tx.address.findFirst({
            where: { userId, id: { not: addressId } },
          });
          if (anotherAddress) {
            await tx.address.update({
              where: { id: anotherAddress.id },
              data: { isDefault: true },
            });
          }
        } else {
          // Only 1 address, cannot unset default
          updateAddressDto.isDefault = true;
        }
      }

      return tx.address.update({
        where: { id: addressId },
        data: updateAddressDto,
      });
    });
  }

  async remove(userId: number, addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this address',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: addressId },
      });

      // If we deleted the default address, and there are remaining addresses, make one default
      if (address.isDefault) {
        const remainingAddress = await tx.address.findFirst({
          where: { userId },
        });

        if (remainingAddress) {
          await tx.address.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Address deleted successfully' };
    });
  }
}
