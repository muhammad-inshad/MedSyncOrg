import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
export class SuperAdminAuthService {
    constructor(_SuperAdminRepo, tokenService, _superAdminMapper) {
        this._SuperAdminRepo = _SuperAdminRepo;
        this.tokenService = tokenService;
        this._superAdminMapper = _superAdminMapper;
    }
    async login(email, password) {
        const superAdmin = await this._SuperAdminRepo.findByEmailWithPassword(email);
        if (!superAdmin) {
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const payload = {
            userId: superAdmin._id.toString(),
            email: superAdmin.email,
            role: "superadmin"
        };
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: this._superAdminMapper.toDTO(superAdmin),
        };
    }
}
