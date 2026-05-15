import { HttpStatusCode } from "../../../constants/enums.js";
import { MESSAGES } from "../../../constants/messages.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
export class HospitalAuthController {
    constructor(_hospitalAuthService) {
        this._hospitalAuthService = _hospitalAuthService;
        this.signup = async (req, res, next) => {
            try {
                const hospitalData = req.body;
                const files = req.files;
                const result = await this._hospitalAuthService.signup(hospitalData, files);
                return ApiResponse.created(res, MESSAGES.ADMIN.SIGNUP_SUCCESS || "Hospital account created successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.loginHospital = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
                }
                const result = await this._hospitalAuthService.loginHospital({ email, password, role: "hospital" });
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
                return ApiResponse.success(res, MESSAGES.ADMIN.LOGIN_SUCCESS || MESSAGES.AUTH.LOGIN_SUCCESS, result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
