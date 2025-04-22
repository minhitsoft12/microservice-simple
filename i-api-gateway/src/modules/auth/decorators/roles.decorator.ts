import { SetMetadata } from '@nestjs/common';
import { RoleType as UserRole } from '@dym-vietnam/internal-shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
