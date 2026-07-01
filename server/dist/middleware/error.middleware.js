import { ZodError } from "zod";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../constants/enums.js";
import { MESSAGES } from "../constants/messages.js";
import logger from "../utils/logger.js";
import { AppError } from "../errors/app.error.js";
export function errorHandler(err, req, res, _next) {
    if (err instanceof ZodError) {
        return ApiResponse.validationError(res, MESSAGES.VALIDATION.INVALID_INPUT, err.issues);
    }
    if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return ApiResponse.error(res, "The uploaded file is too large. Please ensure the file size is within the allowed limit.", null, HttpStatusCode.PAYLOAD_TOO_LARGE);
    }
    if (err.type === 'entity.too.large') {
        return ApiResponse.error(res, "The request payload is too large. Please ensure data size is within the allowed limit.", null, HttpStatusCode.PAYLOAD_TOO_LARGE);
    }
    let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    if ('statusCode' in err && typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
    }
    else if ('status' in err && typeof err.status === 'number') {
        statusCode = err.status;
    }
    const message = err.message || MESSAGES.SERVER.ERROR;
    if (err instanceof AppError) {
        if (err.isOperational) {
            logger.error(err.message);
            return ApiResponse.error(res, message, null, statusCode);
        }
        logger.error(`Unexpected error: ${err.message}`);
        return ApiResponse.error(res, MESSAGES.SERVER.ERROR, null, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
    logger.error(`Unhandled error: ${err.message}`);
    return ApiResponse.error(res, message, null, statusCode);
}
export default errorHandler;
