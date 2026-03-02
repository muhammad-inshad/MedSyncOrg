import { AppError } from "./app.error.ts";

export class AuthError extends AppError {
    constructor(message: string, statusCode: number = 401) {
        super(message, statusCode);
        this.name = "AuthError";
    }       
}