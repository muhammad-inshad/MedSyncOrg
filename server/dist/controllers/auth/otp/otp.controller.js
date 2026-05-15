import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { MESSAGES } from "../../../constants/messages.js";
export default class OtpController {
    constructor(otpService) {
        this.otpService = otpService;
    }
    async sendOtp(req, res, next) {
        try {
            const { email, purpose, role } = req.body;
            if (!email) {
                ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
            }
            await this.otpService.sendOtp(email, purpose, role);
            return ApiResponse.success(res, MESSAGES.AUTH.OTP_SENT);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { signupData, otp } = req.body;
            if (!signupData || !signupData.email) {
                return ApiResponse.validationError(res, "Missing signup data or email");
            }
            await this.otpService.verifyOtp(signupData.email, otp);
            return ApiResponse.success(res, MESSAGES.AUTH.OTP_VERIFIED);
        }
        catch (error) {
            next(error);
        }
    }
}
