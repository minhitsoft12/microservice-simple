import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../common/utils/catch-errors";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
        throw new UnauthorizedException("Unauthorized. Please login!");
    }
    next();
};

export default authenticate;
