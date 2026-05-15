import { AuthResponse } from "../../../interfaces/auth.types.js";

export interface ISuperAdminAuthService {
    login(email: string, password: string): Promise<AuthResponse>;
}