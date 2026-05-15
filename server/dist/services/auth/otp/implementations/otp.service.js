import { generateOtp } from "../../../../utils/otp/otp.util.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { MESSAGES } from "../../../../constants/messages.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { SuccessResponseSchema } from "../../../../dto/auth/success-response.dto.js";
export class OtpService {
    constructor(userRepo, otpRepository, emailService, hospitalRepo, doctorRepo) {
        this.userRepo = userRepo;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.hospitalRepo = hospitalRepo;
        this.doctorRepo = doctorRepo;
    }
    async sendOtp(email, purpose, role) {
        const cleanEmail = email.trim().toLowerCase();
        let existingUser = null;
        console.log(role);
        if (role === "doctor") {
            existingUser = await this.doctorRepo.findByEmail(cleanEmail);
        }
        else if (role === "patient") {
            existingUser = await this.userRepo.findByEmail(cleanEmail);
        }
        else if (role === "hospital") {
            existingUser = await this.hospitalRepo.findByEmail(cleanEmail);
        }
        if (purpose === "forgot-password") {
            if (!existingUser) {
                ApiResponse.throwError(HttpStatusCode.NOT_FOUND, `No ${role} found with this email address`);
            }
        }
        else if (purpose === "signup") {
            if (existingUser) {
                ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.AUTH.ALREADY_EXISTS);
            }
        }
        const otp = generateOtp();
        console.log(`OTP for ${cleanEmail}: ${otp}`);
        await this.otpRepository.saveOtp(cleanEmail, otp);
        await this.emailService.sendOtpEmail(cleanEmail, otp);
        return SuccessResponseSchema.parse({
            success: true,
            message: "OTP sent successfully",
        });
    }
    async verifyOtp(email, userOtp) {
        const cleanEmail = email.trim().toLowerCase();
        const storedOtp = await this.otpRepository.getOtpByEmail(cleanEmail);
        if (!storedOtp) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "No OTP request found for this email or OTP expired");
        }
        if (storedOtp.otp !== userOtp) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid OTP code");
        }
        await this.otpRepository.deleteOtpByEmail(cleanEmail);
        return SuccessResponseSchema.parse({
            success: true,
            message: "OTP verified successfully",
        });
    }
}
