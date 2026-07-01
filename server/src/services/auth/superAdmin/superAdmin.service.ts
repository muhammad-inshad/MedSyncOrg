import bcrypt from "bcryptjs";
import { ISuperAdminAuthService } from "./superAdmin.auth.service.interface.js";
import { ITokenService } from "../../token/token.service.interface.js";
import { ISuperAdminRepository } from "../../../repositories/superAdmin/interfaces/superAdmin.repository.interface.js";
import { MESSAGES } from "../../../constants/messages.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { AuthResponse } from "../../../interfaces/auth.types.js";
import { SuperAdminMapper } from "../../../mappers/superAdmin.mapper.js";

export class SuperAdminAuthService implements ISuperAdminAuthService {
    constructor(
        private readonly _SuperAdminRepo: ISuperAdminRepository,
        private readonly tokenService: ITokenService,
        private readonly _superAdminMapper: SuperAdminMapper
    ) {

    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const superAdmin = await this._SuperAdminRepo.findByEmailWithPassword(email);
        if (!superAdmin) {
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const isMatch = await bcrypt.compare(password, superAdmin!.password!);

        if (!isMatch) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }
        const payload = {
            userId: superAdmin!._id.toString(),
            email: superAdmin!.email,
            role: "superadmin"
        };

        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: this._superAdminMapper.toDTO(superAdmin!),
        };
    }
}
