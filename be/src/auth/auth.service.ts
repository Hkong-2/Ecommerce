import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Xử lý validate user sau khi login Google thành công
   * - Nếu chưa có trong DB: tạo mới với Role.USER
   * - Nếu đã có: có thể cập nhật thông tin nếu cần (ở đây chỉ trả về user)
   * @param profile Thông tin nhận được từ Google
   * @returns User đã được lấy/tạo từ DB
   */

  async validateGoogleUser(profile: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const email = profile.emails?.[0]?.value;

      if (!email) {
        throw new Error('No email found from Google profile');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const fullName = profile.displayName || 'Unknown User';

      if (!user) {
        // Tạo người dùng mới nếu chưa tồn tại
        user = await this.prisma.user.create({
          data: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            email,
            // Google auth không có password nên có thể dùng password rỗng hoặc random string
            // Tốt nhất nên cấu hình để bỏ qua password ở mức schema nếu cho phép,
            // nhưng ở đây schema bắt buộc password nên để 1 chuỗi ngẫu nhiên/chuỗi rỗng.
            password: '',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fullName,
            role: Role.USER, // Phân quyền mặc định
          },
        });
      } else {
        // Cập nhật thông tin nếu đã tồn tại
        if (user.fullName !== fullName) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: { fullName },
          });
        }
      }

      return user;
    } catch {
      throw new InternalServerErrorException('Error validating Google user');
    }
  }

  /**
   * Tạo JWT access token cho user
   * @param user Thông tin user
   * @returns Token chuỗi JWT
   */

  login(user: any) {
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      sub: user.id, // ID người dùng
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: user.role, // Vai trò (dùng cho RoleGuard)
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validate admin credentials
   * - Finds user by email
   * - Checks if user exists and has ADMIN role
   * - Verifies password hash
   * @param adminLoginDto Email and password
   * @returns User object if valid, throws exception otherwise
   */
  async validateAdminUser(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Access denied: Admin only');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }
}
