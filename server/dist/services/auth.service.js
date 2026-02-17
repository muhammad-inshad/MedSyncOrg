import bcrypt from "bcrypt";
export class AuthService {
    constructor(userRepo, tokenService, adminRepo, doctorRepo) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
        this.adminRepo = adminRepo;
        this.doctorRepo = doctorRepo;
    }
    async signup(signupData) {
        const existingUser = await this.userRepo.findByEmail(signupData.email);
        if (existingUser) {
            throw { status: 400, message: "User already exists with this email" };
        }
        const hashedPassword = await bcrypt.hash(signupData.password, 10);
        return this.userRepo.create({
            ...signupData,
            password: hashedPassword,
        });
    }
    async login(loginData) {
        const user = await this.userRepo.findByEmail(loginData.email);
        if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
            throw { status: 400, message: "Invalid email or password" };
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: loginData.role
        };
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        const { password, ...safeUser } = user.toObject ? user.toObject() : user;
        return { user: safeUser, accessToken, refreshToken };
    }
    async resetPassword(email, password, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        let repo;
        if (role === "doctor") {
            repo = this.doctorRepo;
        }
        else if (role === "patient") {
            repo = this.userRepo;
        }
        else if (role === "admin") {
            repo = this.adminRepo;
        }
        if (!repo)
            throw { status: 400, message: "Invalid role provided" };
        const user = await repo.findByEmail(email);
        if (!user)
            throw { status: 404, message: `${role} not found` };
        await repo.updatePassword(email, hashedPassword);
        return { success: true, message: "Password updated successfully" };
    }
    async refreshAccessToken(refreshToken) {
        const decoded = this.tokenService.verifyRefreshToken(refreshToken);
        const newAccessToken = this.tokenService.generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        });
        return { accessToken: newAccessToken };
    }
}
