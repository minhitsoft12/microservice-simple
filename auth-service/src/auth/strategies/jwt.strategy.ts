import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@shared/constants/service-names.constant';
import { UserServiceTCPMessages } from '@shared/constants/tcp-messages/user-service.constant';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @Inject(SERVICE_NAMES.USER_SERVICE) private userServiceClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', ''),
    });
  }

  async validate(payload: any): Promise<any> {
    try {
      // Get the complete user profile with role and permissions
      const response = await firstValueFrom(
        this.userServiceClient.send(UserServiceTCPMessages.GET_PROFILE, {
          userId: payload.sub,
        }),
      );

      if (response.status !== 200 || !response.data.user) {
        this.logger.warn(
          `User not found during JWT validation: ${payload.sub}`,
        );
        throw new UnauthorizedException('User not found');
      }

      const user = response.data.user;

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        this.logger.warn(`Inactive user attempted access: ${payload.sub}`);
        throw new UnauthorizedException('User account is not active');
      }

      // Get user permissions based on role
      const permissionsResponse = await firstValueFrom(
        this.userServiceClient.send(
          UserServiceTCPMessages.GET_ROLE_PERMISSIONS,
          {
            roleId: user.roleId,
          },
        ),
      );

      if (permissionsResponse.status !== 200) {
        this.logger.warn(
          `Failed to retrieve permissions for user: ${payload.sub}`,
        );
        throw new UnauthorizedException('Failed to retrieve user permissions');
      }

      // Return user with permissions
      return {
        ...user,
        permissions: permissionsResponse.data.permissions,
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
