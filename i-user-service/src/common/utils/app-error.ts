import { HTTP_STATUS, HttpStatusCodeType } from "../../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

export class AppError extends Error {
    public statusCode: HttpStatusCodeType;
    public errorCode?: ErrorCode;
    constructor(
        message: string,
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        errorCode?: ErrorCode
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
