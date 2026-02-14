export interface ITokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface ITokenService {
    generateAccessToken(payload: ITokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyRefreshToken(token: string): ITokenPayload;
}
