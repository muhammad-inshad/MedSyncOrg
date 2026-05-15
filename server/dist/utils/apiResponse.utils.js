import { HttpStatusCode } from "../constants/enums.js";
import { MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app.error.js";
export class ApiResponse {
    static success(res, message = "Success", data, statusCode = HttpStatusCode.OK, pagination) {
        return res.status(statusCode).json({
            success: true,
            message,
            data: data || null,
            pagination
        });
    }
    static error(res, message = MESSAGES.SERVER.ERROR, errors, statusCode = HttpStatusCode.BAD_REQUEST) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors || null
        });
    }
    static created(res, message = "Resource created successfully", data) {
        return this.success(res, message, data, HttpStatusCode.CREATED);
    }
    static validationError(res, message = MESSAGES.VALIDATION.INVALID_INPUT, errors) {
        return this.error(res, message, errors, HttpStatusCode.BAD_REQUEST);
    }
    static unauthorized(res, message = MESSAGES.AUTH.UNAUTHORIZED) {
        return this.error(res, message, null, HttpStatusCode.UNAUTHORIZED);
    }
    static forbidden(res, message = MESSAGES.AUTH.FORBIDDEN) {
        return this.error(res, message, null, HttpStatusCode.FORBIDDEN);
    }
    static notFound(res, message = MESSAGES.SERVER.NOT_FOUND) {
        return this.error(res, message, null, HttpStatusCode.NOT_FOUND);
    }
    static throwError(statusCode, message) {
        throw new AppError(message, statusCode);
    }
    static internalServerError(res, message = MESSAGES.SERVER.ERROR) {
        return this.error(res, message, null, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
}
