import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SERVICE_NAMES } from '@dym-vietnam/internal-shared';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy');

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:4000/api/auth/google/callback',
      ),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): void {
    try {
      this.logger.log('Processing Google profile');

      if (!profile || !profile._json) {
        this.logger.error('Invalid profile data received from Google');
        return done(new Error('Invalid profile data received'), false);
      }

      const {
        name,
        email,
        picture,
        sub,
        hd = '@gmail.com',
        email_verified,
      } = profile._json;

      if (!email) {
        this.logger.error('No email provided in Google profile');
        return done(new Error('No email provided in profile'), false);
      }

      let service = SERVICE_NAMES.AUTH_SERVICE;

      try {
        if (request.query.state) {
          const stateData = JSON.parse(
            Buffer.from(request.query.state, 'base64').toString(),
          );
          service = stateData.service;
        }
      } catch (error) {
        this.logger.error(`Failed to parse state: ${error.message}`);
      }

      const allowedDomains = ['dym.jp', 'dymvietnam.jp', 'dymvietnam.net'];

      // Email verification check
      if (!email_verified) {
        this.logger.warn(`Unverified email attempted login: ${email}`);
        return done(new Error('Email not verified with Google'), false);
      }

      // Domain check
      if (!allowedDomains.includes(hd)) {
        this.logger.warn(
          `Unauthorized domain attempted login: ${hd}, email: ${email}`,
        );
        return done(new Error('Domain not allowed'), false);
      }

      const user = {
        sub,
        email,
        name,
        picture,
        service,
      };

      return done(null, user);
    } catch (error) {
      this.logger.error(
        `Exception in Google strategy validation: ${error.message}`,
        error.stack,
      );
      return done(error, false);
    }
  }
}
