import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' },
            { id: 'asc' },
          ],
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { fullName, phone } = updateUserDto;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
      },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' },
            { id: 'asc' },
          ],
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
