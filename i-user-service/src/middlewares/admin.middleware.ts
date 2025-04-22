import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../common/utils/catch-errors";
import { Roles } from "../common/enums/role.enum";
import { ErrorCode } from "../common/enums/error-code.enum";
import { HTTP_STATUS } from "../config/http.config";
import RoleModel from "../models/role.model";

const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || !req.user.roleId) {
        throw new UnauthorizedException(
            "Forbidden: Admin access required",
            ErrorCode.ACCESS_FORBIDDEN,
            HTTP_STATUS.FORBIDDEN
        );
    }

    // Find the role by ID
    const role = await RoleModel.findById(req.user.roleId).lean();
    if (!role || role.name !== Roles.ADMIN) {
        throw new UnauthorizedException(
            "Forbidden: Admin access required",
            ErrorCode.ACCESS_FORBIDDEN,
            HTTP_STATUS.FORBIDDEN
        );
    }
    next();
};

export default adminMiddleware;
