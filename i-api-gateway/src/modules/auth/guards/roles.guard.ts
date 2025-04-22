import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleType } from '@dym-vietnam/internal-shared';
import { PermissionType } from '@dym-vietnam/internal-shared';

// New decorator key for permissions
export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If no user or user has no permissions, deny access
    if (!user || !user.permissions) {
      this.logger.warn(
        'User without permissions attempted to access protected resource',
      );
      return false;
    }

    // Check roles if required
    if (requiredRoles) {
      const hasRole = requiredRoles.some(
        (role) =>
          user.role === role || (user.roles && user.roles.includes(role)),
      );

      if (!hasRole) {
        this.logger.warn(
          `User ${user._id} lacks required role. Required: ${requiredRoles.join(', ')}, Has: ${user.role}`,
        );
        return false;
      }
    }

    // Check permissions if required
    if (requiredPermissions) {
      const hasPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasPermissions) {
        this.logger.warn(
          `User ${user._id} lacks required permissions. Required: ${requiredPermissions.join(', ')}, Has: ${user.permissions}`,
        );
        return false;
      }
    }

    return true;
  }
}
