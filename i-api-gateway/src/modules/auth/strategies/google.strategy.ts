import {PassportStrategy} from '@nestjs/passport';
import {Strategy, VerifyCallback} from 'passport-google-oauth20';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy');

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:4000/api/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log('Profile', profile._json);
    const {name, email, picture, sub, hd, email_verified} = profile._json;

    const user = {
      sub: sub,
      email: email,
      name: name,
      picture: picture,
    };

    done(null, user);
  }
}