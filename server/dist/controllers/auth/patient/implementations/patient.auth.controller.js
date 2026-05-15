import { MESSAGES } from "../../../../constants/messages.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
class patientAuthController {
    constructor(authService) {
        this.authService = authService;
        this.signup = async (req, res, next) => {
            try {
                const signupData = req.body;
                const user = await this.authService.signup(signupData);
                return ApiResponse.created(res, "Account created successfully", user);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const loginData = req.body;
                const result = await this.authService.login(loginData);
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
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
                return ApiResponse.success(res, "Login successful", {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: { ...result.user, role: loginData.role }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.refresh = async (req, res, next) => {
            try {
                let refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) {
                    refreshToken = req.body?.refreshToken;
                }
                if (!refreshToken) {
                    const authHeader = req.headers.authorization;
                    if (authHeader && authHeader.startsWith("Refresh ")) {
                        refreshToken = authHeader.substring(8);
                    }
                }
                if (!refreshToken) {
                    return ApiResponse.unauthorized(res, MESSAGES.AUTH.SESSION_EXPIRED || "Session expired");
                }
                const result = await this.authService.refreshAccessToken(refreshToken);
                res.cookie("accessToken", result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
                    path: "/",
                });
                return ApiResponse.success(res, "Token refreshed successfully", {
                    accessToken: result.accessToken
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { email, password, role } = req.body;
                const result = await this.authService.resetPassword(email, password, role);
                return ApiResponse.success(res, result.message);
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res) => {
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            };
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            return ApiResponse.success(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
        };
    }
}
export default patientAuthController;
