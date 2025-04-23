import {Body, Controller, Get, Logger, Post, Req, Request, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/tokens.dto';
import { ApiRouteNames } from '../../shared/enums/api.enum';
import {GoogleAuthGuard} from "./guards/google-auth.guard";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @Post(ApiRouteNames.SIGN_IN)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post(ApiRouteNames.REFRESH_TOKEN)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refresh_token);
  }

  @Get(ApiRouteNames.PROFILE)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req): any {
    return req.user;
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login with Google' })
  googleAuth() {
    // The request is handled by passport-google-oauth20
    // This route will redirect to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google auth callback' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
    this.logger.log(`Google login callback for user: ${req.user?.email}`);
    const result = await this.authService.googleLogin(req.user);

    // You can redirect to frontend with token as query param
    // or handle this however you need based on your frontend setup
    const redirectUrl = `http://localhost:3002/auth/callback?token=${result.access_token}&refresh=${result.refresh_token}`;
    return res.redirect(redirectUrl);
  }
}
