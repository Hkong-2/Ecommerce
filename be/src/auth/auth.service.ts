import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  generateJwt(user: any) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
          access_token: this.jwtService.sign(payload)
      }
  }
}
