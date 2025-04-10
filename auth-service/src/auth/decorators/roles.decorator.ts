import { SetMetadata } from '@nestjs/common';
import { RoleType as UserRole } from '@shared/enums/role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
