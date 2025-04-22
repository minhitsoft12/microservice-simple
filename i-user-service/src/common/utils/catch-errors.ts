import { HTTP_STATUS, HttpStatusCodeType } from "../../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import { AppError } from "./app-error";

export class NotFoundException extends AppError {
    constructor(message = "Resource not found", errorCode?: ErrorCode) {
        super(
            message,
            HTTP_STATUS.NOT_FOUND,
            errorCode || ErrorCode.RESOURCE_NOT_FOUND
        );
    }
}

export class BadRequestException extends AppError {
    constructor(message = "Bad Request", errorCode?: ErrorCode) {
        super(message, HTTP_STATUS.BAD_REQUEST, errorCode);
    }
}

export class UnauthorizedException extends AppError {
    constructor(
        message = "Unauthorized Access",
        errorCode?: ErrorCode,
        status: HttpStatusCodeType = HTTP_STATUS.UNAUTHORIZED
    ) {
        super(message, status, errorCode || ErrorCode.ACCESS_UNAUTHORIZED);
    }
}

export class InternalServerException extends AppError {
    constructor(message = "Internal Server Error", errorCode?: ErrorCode) {
        super(
            message,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            errorCode || ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
}

export class HttpException extends AppError {
    constructor(
        message = "Http Exception Error",
        statusCode: HttpStatusCodeType,
        errorCode?: ErrorCode
    ) {
        super(message, statusCode, errorCode);
    }
}
