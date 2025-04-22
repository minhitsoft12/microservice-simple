import { z } from "zod";
import { ErrorRequestHandler, Response } from "express";
import { HTTP_STATUS } from "../config/http.config";
import { AppError } from "../common/utils/app-error";
import { ErrorCode } from "../common/enums/error-code.enum";

const formatZodError = (res: Response, error: z.ZodError): any => {
    const errors = error?.issues?.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors,
        errorCode: ErrorCode.VALIDATION_ERROR,
    });
};

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next
): any => {
    if (error instanceof SyntaxError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                "Invalid JSON payload passed, please check your request body and try again.",
        });
    }

    if (error instanceof z.ZodError) {
        return formatZodError(res, error);
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        error: error?.message || "Unknown error occurred",
    });
};
