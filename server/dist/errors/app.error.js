import { HttpStatusCode } from "../constants/enums.js";
export class AppError extends Error {
    constructor(message, statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
