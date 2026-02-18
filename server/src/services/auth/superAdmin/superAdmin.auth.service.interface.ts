

export interface ISuperAdminAuthService {
    login(email: string, password: string): Promise<{ user: { id: string; email: string; role: string; isActive: boolean }; accessToken: string; refreshToken: string }>;
}