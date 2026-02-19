import { Response } from "express";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import { PaginationMeta } from "../interfaces/pagination.ts";


export class ApiResponse {
    static success<T>(
        res: Response,
        message: string = "Success",
        data?: T,
        statusCode: HttpStatusCode = HttpStatusCode.OK,
        pagination?: PaginationMeta
    ) {
        return res.status(statusCode).json({
            success: true,
            message,
            data: data || null,
            pagination
        });
    }

    static error<T>(
        res: Response,
        message: string = MESSAGES.SERVER.ERROR,
        errors?: T,
        statusCode: HttpStatusCode = HttpStatusCode.BAD_REQUEST
    ) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors || null
        });
    }

    static created<T>(res: Response, message: string = "Resource created successfully", data?: T) {
        return this.success(res, message, data, HttpStatusCode.CREATED);
    }

    static validationError<T>(res: Response, message: string = MESSAGES.VALIDATION.INVALID_INPUT, errors?: T) {
        return this.error(res, message, errors, HttpStatusCode.BAD_REQUEST);
    }

    static unauthorized(res: Response, message: string = MESSAGES.AUTH.UNAUTHORIZED) {
        return this.error(res, message, null, HttpStatusCode.UNAUTHORIZED);
    }

    static forbidden(res: Response, message: string = MESSAGES.AUTH.FORBIDDEN) {
        return this.error(res, message, null, HttpStatusCode.FORBIDDEN);
    }

    static notFound(res: Response, message: string = MESSAGES.SERVER.NOT_FOUND) {
        return this.error(res, message, null, HttpStatusCode.NOT_FOUND);
    }

    static throwError(statusCode: HttpStatusCode, message: string): never {
        throw { status: statusCode, message };
    }
}
