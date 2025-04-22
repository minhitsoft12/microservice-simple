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
import { SERVICE_NAMES } from '@dym-vietnam/internal-shared';
import { UserServiceTCPMessages } from '@dym-vietnam/internal-shared';
import { firstValueFrom } from 'rxjs';
import { UserStatusEnum } from '@dym-vietnam/internal-shared';

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
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', ''),
    });
  }

  async validate(payload: any): Promise<any> {
    try {
      // Get the complete user profile with role and permissions
      const response = await firstValueFrom(
        this.userServiceClient.send(UserServiceTCPMessages.GET_PROFILE, {
          user: {
            _id: payload.sub,
            name: payload.name,
          },
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
      if (user.status === UserStatusEnum.INACTIVE) {
        this.logger.warn(`Inactive user attempted access: ${payload.sub}`);
        throw new UnauthorizedException('User account is not active');
      }

      // Get user permissions based on role
      const permissionsResponse = await firstValueFrom(
        this.userServiceClient.send(
          `${UserServiceTCPMessages.GET_PERMISSION_BY_ROLE}.${user.roleId._id}`,
          {},
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
      throw new UnauthorizedException(`JWT validation error: ${error.message}`);
    }
  }
}
