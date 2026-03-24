import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'], // Các thông tin yêu cầu truy cập
    });
  }

  /**
   * Phương thức xác thực sau khi Google trả callback
   * @param accessToken Token truy cập của Google
   * @param refreshToken Token để lấy lại access token khi hết hạn (nếu có)
   * @param profile Thông tin profile trả về từ Google
   * @param done Hàm callback hoàn thành logic
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Gọi AuthService để xử lý kiểm tra / tạo user
      const user = await this.authService.validateGoogleUser(profile);

      if (!user) {
        return done(new UnauthorizedException(), false);
      }

      // Xong thì gắn user vào payload để NestJS (Passport) tiếp tục
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
