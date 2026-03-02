import { HttpStatusCode } from "../constants/httpStatus.ts";

export class AppError extends Error {
    statusCode: number;
    status: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}