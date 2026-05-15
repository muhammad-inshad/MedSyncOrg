import { HttpStatusCode } from "../../../constants/enums.js";
import { MESSAGES } from "../../../constants/messages.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import logger from "../../../utils/logger.js";
export class SuperAdminAuthController {
    constructor(_SuperadminAuthService) {
        this._SuperadminAuthService = _SuperadminAuthService;
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                logger.debug(`Login attempt for email: ${email}`);
                if (!email || !password) {
                    ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
                }
                const result = await this._SuperadminAuthService.login(email, password);
                res.cookie("refreshToken", result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                res.cookie("accessToken", result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
                    path: "/",
                });
                return ApiResponse.success(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: result.user
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
