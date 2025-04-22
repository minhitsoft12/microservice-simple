import { PermissionDocument } from "./../../models/permission.model";
import { RoleDocument } from "../../models/role.model";
import { UnauthorizedException } from "./catch-errors";

export const roleGuard = (
    role: RoleDocument,
    requiredPermissions: PermissionDocument["name"][]
) => {
    const permissions = role.permissions.map(
        (permission: any) => permission.name || permission.toString()
    );

    const hasPermissions = requiredPermissions.every((permission) =>
        permissions.includes(permission)
    );

    if (!hasPermissions) {
        throw new UnauthorizedException(
            "You don't have the necessary permissions to perform this action"
        );
    }
};
