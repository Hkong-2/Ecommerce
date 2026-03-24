import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      let user = await this.usersService.findOne(payload.email);

      if (!user) {
        // Random password for google users
        const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
        user = await this.usersService.create({
          email: payload.email,
          fullName: payload.name || 'Unknown',
          password: passwordHash,
          // other fields defaults to schema
        });
      }

      return {
        access_token: this.jwtService.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
