import { roleGuard } from "./../common/utils/role-guard";
import { ErrorCode } from "../common/enums/error-code.enum";
import { FilterQuery } from "../common/interface/filter.interface";
import {
    NotFoundException,
    UnauthorizedException,
} from "../common/utils/catch-errors";
import RoleModel, { RoleDocument } from "../models/role.model";
import UserModel from "../models/user.model";
import "../models/permission.model"; // Import Permission model to register the schema

export class BaseService {
    constructor() {}
    public async roleGuard(
        userId: string,
        permissions: string[]
    ): Promise<void> {
        const user = await UserModel.findById(userId)
            .populate([
                {
                    path: "roleId",
                    select: "_id name permissions",
                    populate: {
                        path: "permissions",
                        select: "_id name",
                    },
                },
            ])
            .exec();
        if (!user) {
            throw new NotFoundException(
                "User not found",
                ErrorCode.AUTH_USER_NOT_FOUND
            );
        }
        if (!user.roleId) {
            throw new UnauthorizedException("User role not found");
        }

        console.log("user", user);

        // const userPermissionSet = new Set(
        //     user.roleId.permissions.map((permission: any) => permission.name)
        // );
        // if (userPermissionSet.size === 0) {
        //     throw new UnauthorizedException(
        //         "User role has no permissions assigned"
        //     );
        // }
        // const missingPermission = permissions.find(
        //     (perm) => !userPermissionSet.has(perm)
        // );
        // if (missingPermission) {
        //     throw new UnauthorizedException(
        //         "You don't have the necessary permissions to perform this action"
        //     );
        // }
        return;
    }
    public async getUserRole(userId: string): Promise<{ role: RoleDocument }> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException(
                "User not found",
                ErrorCode.AUTH_USER_NOT_FOUND
            );
        }

        if (!user.roleId) {
            throw new UnauthorizedException("User role not found");
        }
        const role = await RoleModel.findById(user.roleId)
            .populate({
                path: "permissions",
                select: "_id name",
            })
            .select("name permissions")
            .lean();
        if (!role) {
            throw new NotFoundException(
                "Role not found",
                ErrorCode.AUTH_NOT_FOUND
            );
        }

        return { role };
    }
    public parseQueryParams<
        TModelFilter extends Record<string, unknown> = Record<string, unknown>
    >(query: Record<string, unknown>): FilterQuery<TModelFilter> {
        return {
            pagination: this.parsePagination(query),
            sort: this.parseSort(query),
            search: this.parseSearch(query),
            filters: this.parseFilters<TModelFilter>(query),
        };
    }
    private parsePagination(query: Record<string, unknown>): {
        page: number;
        limit: number;
        skip: number;
    } {
        const page = Math.max(1, parseInt(String(query.page || "1")));
        const limit = Math.max(1, parseInt(String(query.limit || "10")));

        return {
            page: isNaN(page) ? 1 : page,
            limit: isNaN(limit) ? 10 : limit,
            skip: (isNaN(page) ? 0 : page - 1) * (isNaN(limit) ? 10 : limit),
        };
    }

    private parseSort(query: Record<string, unknown>): {
        field: string;
        order: "asc" | "desc";
    } {
        return {
            field: query.sort ? String(query.sort) : "createdAt",
            order: String(query.order).toLowerCase() === "asc" ? "asc" : "desc",
        };
    }

    private parseSearch(query: Record<string, unknown>): RegExp {
        return query.search
            ? new RegExp(String(query.search), "i")
            : new RegExp("");
    }

    private parseFilters<T extends Record<string, unknown>>(
        query: Record<string, unknown>
    ): T {
        const reservedParams = ["page", "limit", "sort", "order", "search"];

        return Object.entries(query)
            .filter(([key]) => !reservedParams.includes(key))
            .reduce((acc, [key, value]) => {
                if (
                    typeof value === "string" &&
                    value.includes("from=") &&
                    value.includes("to=")
                ) {
                    const fromMatch = value.match(/from=([^&]+)/);
                    const toMatch = value.match(/to=([^&]+)/);

                    if (fromMatch) {
                        const fromDate = new Date(fromMatch[1]);
                        const toDate = toMatch ? new Date(toMatch[1]) : null;
                        toDate && toDate.setDate(toDate.getDate() + 1);

                        return {
                            ...acc,
                            [key]: {
                                $gte: fromDate,
                                ...(toDate && { $lt: toDate }),
                            },
                        };
                    }
                }
                return {
                    ...acc,
                    [key]: {
                        $in:
                            typeof value === "string"
                                ? value.split(",")
                                : String(value).split(","),
                    },
                };
            }, {}) as T;
    }
}
