import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/tokens.dto';
import { ApiRouteNames } from '../../shared/enums/api.enum';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly configService = new ConfigService();
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
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
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
  @Get('google-url')
  @ApiOperation({ summary: 'Get Google login URL for frontend' })
  getGoogleAuthUrl(@Request() req) {
    const serviceName = req.query.service as string | undefined;
    const googleLoginUrl = this.authService.getGoogleAuthUrl(serviceName);

    return { url: googleLoginUrl };
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
    this.logger.log('Google callback triggered');

    // Extract the service from the state parameter
    let service = 'default';
    try {
      if (req.query.state) {
        const stateData = JSON.parse(
          Buffer.from(req.query.state, 'base64').toString(),
        );
        service = stateData.service || 'default';
      }
    } catch (error) {
      this.logger.error(`Failed to parse state parameter: ${error.message}`);
    }

    // Get the appropriate callback URL from config based on service
    const callbackUrl = this.configService.get<string>(
      `FRONTEND_CALLBACK_URL_${service.toUpperCase()}`,
      this.configService.get<string>(
        'FRONTEND_CALLBACK_URL_DEFAULT',
        'http://localhost:3000/auth/callback',
      ),
    );

    this.logger.log(
      `Using callback URL for service ${service}: ${callbackUrl}`,
    );

    // Handle authentication errors
    if (req.authError) {
      let errorCode = 'authentication_failed';
      let errorMessage = req.authError.message ?? 'Authentication failed';

      this.logger.error(`Google auth error: ${req.authError.message}`);

      if (errorMessage.includes('Domain not allowed')) {
        errorMessage = 'Your email domain is not authorized';
        errorCode = 'unauthorized_domain';
      } else if (errorMessage.includes('Email not verified')) {
        errorMessage = 'Email address not verified with Google';
        errorCode = 'unverified_email';
      }

      const errorParams = new URLSearchParams({
        error: errorCode,
        message: errorMessage,
        success: 'false',
        service,
      });

      return res.redirect(`${callbackUrl}?${errorParams.toString()}`);
    }

    // If no user data despite no error, it's also an error condition
    if (!req.user) {
      this.logger.error('Google authentication failed: No user data received');

      const errorParams = new URLSearchParams({
        error: 'no_user_data',
        message: 'No user data received from authentication provider',
        success: 'false',
        service,
      });

      return res.redirect(`${callbackUrl}?${errorParams.toString()}`);
    }

    this.logger.log(`Google login callback for user: ${req.user?.email}`);

    try {
      const { user: _, ...withoutUser } = await this.authService.googleLogin(
        req.user,
      );

      const urlParams = new URLSearchParams({
        ...withoutUser,
        expiresIn: String(withoutUser.expiresIn),
        success: 'true',
        service,
      });

      // Build the redirect URL with tokens
      const redirectUrl = `${callbackUrl}?${urlParams.toString()}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(
        `Error during Google login processing: ${error.message}`,
        error.stack,
      );

      // Handle specific errors from the authService.googleLogin method
      const errorMessage = 'Authentication processing failed';
      const errorCode = 'processing_error';

      const errorParams = new URLSearchParams({
        error: errorCode,
        message: errorMessage,
        success: 'false',
        service,
      });

      return res.redirect(`${callbackUrl}?${errorParams.toString()}`);
    }
  }
}
