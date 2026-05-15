import { AppError } from "./app.error.js";
export class AuthError extends AppError {
    constructor(message, statusCode = 401) {
        super(message, statusCode);
        this.name = "AuthError";
    }
}
