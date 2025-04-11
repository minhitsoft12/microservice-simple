import { SetMetadata } from '@nestjs/common';
import { RoleType as UserRole } from '@shared/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
