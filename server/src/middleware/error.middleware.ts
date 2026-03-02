import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import logger from "../utils/logger.ts";
import { AppError } from "../errors/app.error.ts";

interface IError extends Error {
    statusCode?: number;
    status?: number;
    isOperational?: boolean;
}

export function errorHandler(
    err: IError | AppError | ZodError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ZodError) {
        return ApiResponse.validationError(res, MESSAGES.VALIDATION.INVALID_INPUT, err.issues);
    }

    let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    if ('statusCode' in err && typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
    } else if ('status' in err && typeof err.status === 'number') {
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
