import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails, photos } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findOne({ googleId: id });
    if (!user) {
      user = await this.usersService.findOne({ email });
      if (user) {
        user = await this.usersService.updateUser({
          where: { email },
          data: { googleId: id, picture: photos[0].value },
        });
      } else {
        user = await this.usersService.createUser({
            googleId: id,
            email,
            name: name.givenName + ' ' + name.familyName,
            picture: photos[0].value,
        });
      }
    }

    done(null, user);
  }
}
