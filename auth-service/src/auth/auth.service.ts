import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { lastValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      // Call the User Service to validate credentials
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await lastValueFrom(
        this.httpService.post(`${userServiceUrl}/login`, {
          username,
          password,
        }),
      );

      const user = response.data;

      if (user && (await bcrypt.compare(password, user.password))) {
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    try {
      // Call the User Service to create a new user
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await lastValueFrom(
        this.httpService.post(`${userServiceUrl}/users`, registerDto),
      );

      const user = response.data;
      return this.generateTokens(user);
    } catch (error) {
      if (error.response?.status === 409) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Call User Service to get latest user data
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
      const response = await lastValueFrom(
        this.httpService.get(`${userServiceUrl}/users/${decoded.sub}`),
      );

      const user = response.data;
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ),
      }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }
}
