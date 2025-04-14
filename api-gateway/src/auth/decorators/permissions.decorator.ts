import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '@shared/interfaces/permission.interface';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
