import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { MESSAGES } from "../../../../constants/messages.js";
import { SuccessResponseSchema } from "../../../../dto/auth/success-response.dto.js";
import { TokenResponseSchema } from "../../../../dto/auth/token-response.dto.js";
export class PatientAuthService {
    constructor(_userRepository, _tokenService, _hospitalRepo, _doctorRepo, _patientMapper) {
        this._userRepository = _userRepository;
        this._tokenService = _tokenService;
        this._hospitalRepo = _hospitalRepo;
        this._doctorRepo = _doctorRepo;
        this._patientMapper = _patientMapper;
    }
    async signup(signupData) {
        const existingUser = await this._userRepository.findByEmail(signupData.email);
        if (existingUser) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.ALREADY_EXISTS);
        }
        const hashedPassword = await bcrypt.hash(signupData.password, 10);
        const newUser = await this._userRepository.create({
            ...signupData,
            password: hashedPassword,
            role: signupData.role,
        });
        return this.mapToResponse(newUser);
    }
    async login(data) {
        const user = await this._userRepository.findByEmail(data.email);
        if (!user) {
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
        }
        if (!user?.password) {
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: data.role,
        };
        const accessToken = this._tokenService.generateAccessToken(payload);
        const refreshToken = this._tokenService.generateRefreshToken(payload);
        return {
            user: this.mapToResponse(user),
            accessToken,
            refreshToken,
        };
    }
    async resetPassword(email, pass, role) {
        let repo = this._userRepository;
        if (role === 'hospital') {
            repo = this._hospitalRepo;
        }
        else if (role === 'doctor') {
            repo = this._doctorRepo;
        }
        const user = await repo.findByEmail(email);
        if (!user)
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
        const hashedPassword = await bcrypt.hash(pass, 10);
        await repo.update(user._id.toString(), { password: hashedPassword });
        return SuccessResponseSchema.parse({ success: true, message: "Password updated successfully" });
    }
    async refreshAccessToken(refreshToken) {
        const payload = this._tokenService.verifyRefreshToken(refreshToken);
        const newAccessToken = this._tokenService.generateAccessToken({
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        });
        return TokenResponseSchema.parse({ accessToken: newAccessToken });
    }
    mapToResponse(user) {
        return this._patientMapper.toDTO(user);
    }
}
