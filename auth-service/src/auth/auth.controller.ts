import {
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthService.name, {
    timestamp: true,
  });
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(
    @Request() loginDto: { body: { email: string; password: string } },
  ) {
    const { email, password } = loginDto.body;
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Get('profile')
  getProfile(@Request() req): any {
    return req.user;
  }
}
