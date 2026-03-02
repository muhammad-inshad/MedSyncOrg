import { AppError } from "./app.error.ts";  

export class ValidationError extends AppError {
    constructor(message: string, statusCode: number = 400) {
        super(message, statusCode);
        this.name = "ValidationError";
    }   
}