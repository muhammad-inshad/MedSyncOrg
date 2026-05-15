import { IAccessTokenPayload, IRefreshTokenPayload, ITokenPayload } from "../../dto/auth/token-payload.dto.js";
export { IAccessTokenPayload, IRefreshTokenPayload, ITokenPayload };

export interface ITokenService {
    generateAccessToken(payload: IAccessTokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyRefreshToken(token: string): IRefreshTokenPayload;
    verifyAccessToken(token: string): IAccessTokenPayload;
}
