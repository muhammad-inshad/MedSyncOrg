import { AuthResponse } from "../../../interfaces/auth.types.ts";

export interface ISuperAdminAuthService {
    login(email: string, password: string): Promise<AuthResponse>;
}