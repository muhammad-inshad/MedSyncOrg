import bcrypt from "bcryptjs";
import { ISuperAdminAuthService } from "./superAdmin.auth.service.interface.ts";
<<<<<<< HEAD
import { ITokenService } from "../../../interfaces/auth.types.ts";
=======
import { ITokenService } from "../../token/token.service.interface.ts";
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)
import { ISuperAdminRepository } from "../../../repositories/superAdmin/interfaces/superAdmin.repository.interface.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { SuperAdminMapper } from "../../../mappers/superAdmin.mapper.ts";

export class SuperAdminAuthService implements ISuperAdminAuthService {
    constructor(
        private readonly _SuperAdminRepo: ISuperAdminRepository,
        private readonly tokenService: ITokenService,
        private readonly _superAdminMapper: SuperAdminMapper
    ) {

    }

    async login(email: string, password: string) {
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
