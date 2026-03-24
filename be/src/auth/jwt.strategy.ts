import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Rút trích token từ phần header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Đảm bảo secret trùng với khi sign() JWT
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
  }

  /**
   * Phương thức validate dùng để bóc tách thông tin từ payload được mã hoá trong JWT.
   * Thông tin sẽ được tự động gán vào biến `req.user`.
   * @param payload Payload của JWT
   * @returns Thong tin nguoi dung (co the bo sung them logic neu can)
   */
  async validate(payload: any) {
    // Nếu token chưa hết hạn và chữ ký đúng thì sẽ gọi logic này
    // Các logic khác như kiểm tra user bị khoá hay xoá chưa (tùy vào yêu cầu nghiệp vụ)
    return { userId: payload.sub, role: payload.role };
  }
}
