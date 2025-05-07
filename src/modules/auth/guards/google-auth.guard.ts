import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);

      return !!result;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);

      // Store the error in the request to be handled by the controller
      const request = context.switchToHttp().getRequest();
      this.logger.error(error.message);
      request.authError = error;

      // Always return true to allow the controller to handle the error
      return true;
    }
  }

  // Override handleRequest to capture any user/info objects
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): any {
    if (err) {
      throw err;
    }

    if (!user) {
      const request = context.switchToHttp().getRequest();
      request.authInfo = info;

      // Returning null will cause the controller to handle this as a "no user" error
      return null;
    }

    return user;
  }
}
