import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint kích hoạt quá trình đăng nhập qua Google.
   * Sử dụng GoogleStrategy qua AuthGuard('google') để chuyển hướng người dùng sang trang Google Login.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Controller rỗng vì Guards sẽ chặn và tự động chuyển hướng tới URL Google Auth API
  }

  /**
   * Endpoint nhận callback sau khi xác thực thành công từ Google.
   * Trả về thông tin access_token nếu login hoàn tất.
   * Thường thì API sẽ trả về token trực tiếp dạng JSON, hoặc Redirect Frontend cùng với token qua query params/cookie.
   * Dưới đây là cách trả về thông qua Redirect, bạn có thể chỉnh lại thành trả JSON tùy yêu cầu client (SPA hay web server rendered)
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google')) // Check lại một lần nữa đảm bảo profile đã validate từ GoogleStrategy
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // req.user được Inject từ hàm validate() bên GoogleStrategy
    const loginResult = this.authService.login(req.user);

    // TODO: Nên redirect người dùng tới Frontend URI, kèm theo JWT ở param hay cookie
    // VD: res.redirect(`http://localhost:3000/login?token=${loginResult.access_token}`);

    // Nếu chỉ là Test API:
    return res.json(loginResult);
  }

  /**
   * Ví dụ 1 route check user profile:
   * Yêu cầu xác thực JWT (Access Token).
   * Lấy thông tin user được giải mã gán vào req.user bởi JwtStrategy.
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return req.user; // Chứa userId và role (cái đã return từ validate method bên JwtStrategy)
  }
}
