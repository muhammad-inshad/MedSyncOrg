import bcrypt from "bcryptjs";
import { ISuperAdminAuthService } from "./superAdmin.auth.service.interface.ts";
import { ITokenService } from "../../../interfaces/auth.types.ts";
import { ISuperAdminRepository } from "../../../repositories/superAdmin/superAdmin.repository.interface.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { StatusCode } from "../../../constants/statusCodes.ts";


export class SuperAdminAuthService implements ISuperAdminAuthService {
    constructor(private readonly _SuperAdminRepo: ISuperAdminRepository, private readonly tokenService: ITokenService) {

    }

    async login(email: string, password: string) {
        const superAdmin = await this._SuperAdminRepo.findByEmailWithPassword(email);
        if (!superAdmin) {
            throw { status: StatusCode.UNAUTHORIZED, message: MESSAGES.AUTH.LOGIN_FAILED };
        }
        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
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
            user: {
                id: superAdmin._id.toString(),
                email: superAdmin.email,
                role: "superadmin",
                isActive: superAdmin.isActive,
            },
        };
    }
}