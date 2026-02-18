import { IAdmin } from "../../../models/admin.model.ts";
import { LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { AdminUploadFiles } from "../../../types/admin.type.ts";
import { UnifiedUser } from "../../../interfaces/auth.types.ts";

export interface IAdminAuthService {
    signup(adminData: Partial<IAdmin>, files: AdminUploadFiles): Promise<{ admin: Partial<IAdmin> }>;
    loginAdmin(loginData: LoginDTO): Promise<{ user: UnifiedUser; accessToken: string; refreshToken: string }>;
}