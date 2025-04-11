import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@shared/constants/service-names.constant';
import { UserServiceTCPMessages } from '@shared/constants/tcp-messages/user-service.constant';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

  async validate(payload: any) {
    try {
      // Get the complete user profile with role and permissions
      const response = await firstValueFrom(
        this.userServiceClient.send(UserServiceTCPMessages.GET_PROFILE, {
          userId: payload.sub,
        }),
      );

      if (response.status !== 200 || !response.data.user) {
        throw new UnauthorizedException('User not found');
      }

      // Get user permissions based on role
      const permissionsResponse = await firstValueFrom(
        this.userServiceClient.send(
          UserServiceTCPMessages.GET_ROLE_PERMISSIONS,
          {
            roleId: response.data.user.roleId,
          },
        ),
      );

      if (permissionsResponse.status !== 200) {
        throw new UnauthorizedException('Failed to retrieve user permissions');
      }

      // Return user with permissions
      return {
        ...response.data.user,
        permissions: permissionsResponse.data.permissions,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}