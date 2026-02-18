export interface AppError extends Error {
    status?: number;
    statusCode?: number;
    code?: number | string;
}
