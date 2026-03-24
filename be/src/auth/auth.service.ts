import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../generated/prisma/client.js';

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
      const email = profile.emails?.[0]?.value;

      if (!email) {
        throw new Error('No email found from Google profile');
      }

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      const fullName = profile.displayName || 'Unknown User';

      if (!user) {
        // Tạo người dùng mới nếu chưa tồn tại
        user = await this.prisma.user.create({
          data: {
            email,
            // Google auth không có password nên có thể dùng password rỗng hoặc random string
            // Tốt nhất nên cấu hình để bỏ qua password ở mức schema nếu cho phép,
            // nhưng ở đây schema bắt buộc password nên để 1 chuỗi ngẫu nhiên/chuỗi rỗng.
            password: '',
            fullName,
            role: Role.USER, // Phân quyền mặc định
          },
        });
      } else {
        // Cập nhật thông tin nếu đã tồn tại
        if (user.fullName !== fullName) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { fullName },
          });
        }
      }

      return user;
    } catch (error) {
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
      sub: user.id, // ID người dùng
      role: user.role, // Vai trò (dùng cho RoleGuard)
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
