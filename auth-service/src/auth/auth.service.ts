import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICE_NAMES } from '@shared/constants/service-names.constant';
import { UserServiceTCPMessages } from '@shared/constants/tcp-messages/user-service.constant';
import { User } from '@shared/interfaces/user.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SERVICE_NAMES.USER_SERVICE) private userServiceClient: ClientProxy,
    private jwtService: JwtService,
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
        throw new UnauthorizedException(
          response?.data?.message ?? 'Unauthorized',
        );
      }
      const user = response.data.user as User;
      if (user) return user;

      return null;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  login(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
