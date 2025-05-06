import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import {
  SERVICE_NAMES,
  User,
  UserServiceTCPMessages,
} from '@dym-vietnam/internal-shared';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SERVICE_NAMES.USER_SERVICE) private userServiceClient: ClientProxy,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient.send(UserServiceTCPMessages.VERIFICATION, {
          email,
          password,
        }),
      );

      if (response.status !== 200) {
        this.logger.warn(`User validation failed: ${response?.data?.message}`);
        throw new UnauthorizedException(
          response?.data?.message ?? 'Invalid credentials',
        );
      }

      const user = response.data.user as User;
      if (!user) {
        this.logger.warn('User validation returned null user');
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`User validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: User) {
    const tokens = this.generateTokens(user);

    // Update last login timestamp
    try {
      await firstValueFrom(
        this.userServiceClient.send(
          `${UserServiceTCPMessages.UPDATE_PROFILE}.${user._id}`,
          { user, lastLogin: new Date() },
        ),
      );
    } catch (error) {
      // Non-critical error, just log it
      this.logger.warn(`Failed to update last login time: ${error.message}`);
    }
    const userResponse = await this.sanitizeUser(user);

    return {
      ...tokens,
      user: userResponse,
    };
  }

  async googleLogin(googleUser: any) {
    try {
      // First check if user exists
      const findUserResponse = await firstValueFrom(
        // this.userServiceClient.send(UserServiceTCPMessages.GOOGLE_AUTH, {
        this.userServiceClient.send('USER.GOOGLE_AUTH', {
          provider: 'GOOGLE',
          displayName: googleUser.name,
          providerId: googleUser.sub,
          picture: googleUser.picture,
          email: googleUser.email,
        }),
      );

      if (findUserResponse.status !== 200) {
        this.logger.error(
          `Google auth failed: ${findUserResponse?.data?.message}`,
        );
        throw new UnauthorizedException('Google authentication failed');
      }

      const user = findUserResponse.data.user;
      return this.login(user);
    } catch (error) {
      this.logger.error(`Google login error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  getGoogleAuthUrl(service: string = 'default'): string {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    const callbackURL = this.configService.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:4000/api/auth/google/callback',
    );
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const state = Buffer.from(JSON.stringify({ service })).toString('base64');

    const params = new URLSearchParams({
      client_id: clientID,
      redirect_uri: callbackURL,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Get user profile to ensure user still exists and is active
      const response = await firstValueFrom(
        this.userServiceClient.send(UserServiceTCPMessages.GET_PROFILE, {
          userId: payload.sub,
        }),
      );

      if (response.status !== 200 || !response.data.user) {
        throw new UnauthorizedException('User not found');
      }

      const user = response.data.user;

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Calculate expiration in seconds
    const decodedToken = this.jwtService.decode(accessToken);
    const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async sanitizeUser(user: User) {
    // Create a copy without sensitive data
    const { permissions: _, ...sanitizedUser } = user;

    try {
      const permissionsResponse = await firstValueFrom(
        this.userServiceClient.send(
          `${UserServiceTCPMessages.GET_PERMISSION_BY_ROLE}.${user.roleId}`,
          {},
        ),
      );
      if (permissionsResponse.status !== 200) {
        this.logger.warn(
          `Failed to retrieve permissions for user: ${user.name}`,
        );
        throw new UnauthorizedException('Failed to retrieve user permissions');
      }
      return {
        ...sanitizedUser,
        permissions: permissionsResponse.data.permissions,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve permissions for user: ${error.message}`,
      );
    }
  }
}
