
export interface IRefreshTokenPayload extends ITokenPayload {
    jti: string;
}
export interface ITokenPayload {
    userId: string;
    email: string;
    role: string;
}
export type IAccessTokenPayload = ITokenPayload

export interface ITokenService {
    generateAccessToken(payload: IAccessTokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyRefreshToken(token: string): IRefreshTokenPayload;
    verifyAccessToken(token: string): IAccessTokenPayload;
}
