import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@shared/constants/service-names.constant';
import { UserServiceTCPMessages } from '@shared/constants/tcp-messages/user-service.constant';
import { User } from '@shared/interfaces/user.interface';
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

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: this.sanitizeUser(user),
    };
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

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      };
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
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Calculate expiration in seconds
    const decodedToken = this.jwtService.decode(accessToken);
    const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    };
  }

  private sanitizeUser(user: User) {
    // Create a copy without sensitive data
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
