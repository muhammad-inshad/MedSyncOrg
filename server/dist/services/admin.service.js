import bcrypt from "bcrypt";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";
export class AdminService {
    constructor(adminRepo, tokenService) {
        this._adminRepo = adminRepo;
        this._tokenService = tokenService;
    }
    async signup(adminData, files) {
        const { email, password, hospitalName } = adminData;
        if (!email || !password || !hospitalName) {
            throw { status: StatusCode.BAD_REQUEST, message: "Required fields missing" };
        }
        const existingAdmin = await this._adminRepo.findByEmail(email);
        if (existingAdmin) {
            throw { status: StatusCode.CONFLICT, message: MESSAGES.ADMIN.HOSPITAL_EXISTS };
        }
        let logoUrl = "";
        let licenceUrl = "";
        if (files.logo) {
            logoUrl = await uploadBufferToCloudinary(files.logo.buffer, "admin/logo");
        }
        if (files.licence) {
            licenceUrl = await uploadBufferToCloudinary(files.licence.buffer, "admin/licence");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await this._adminRepo.create({
            ...adminData,
            password: hashedPassword,
            logo: logoUrl,
            licence: licenceUrl,
            isActive: true,
        });
        const adminObject = admin.toObject();
        const { password: _, __v, ...adminWithoutPassword } = adminObject;
        return {
            admin: adminWithoutPassword,
        };
    }
    async loginAdmin(loginData) {
        const admin = await this._adminRepo.findByEmailWithPassword(loginData.email);
        if (!admin) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }
        if (!admin.isActive) {
            throw { status: StatusCode.FORBIDDEN, message: MESSAGES.AUTH.ACCOUNT_BLOCKED };
        }
        const isPasswordMatch = await bcrypt.compare(loginData.password, admin.password);
        if (!isPasswordMatch) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }
        const accessToken = this._tokenService.generateAccessToken({
            userId: admin._id.toString(),
            email: admin.email,
            role: loginData.role
        });
        const refreshToken = this._tokenService.generateRefreshToken({
            userId: admin._id.toString(),
            email: admin.email,
            role: loginData.role
        });
        const adminObj = admin.toObject();
        const { password, ...safeUser } = adminObj;
        return { user: safeUser, accessToken, refreshToken };
    }
    async getAdminProfile(adminID) {
        try {
            const admin = await this._adminRepo.findById(adminID);
            if (!admin) {
                throw { status: StatusCode.NOT_FOUND, message: "admin not found" };
            }
            return {
                ...admin.toObject(),
                role: "admin"
            };
        }
        catch (error) {
            throw {
                status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
                message: error.message || MESSAGES.ADMIN.FETCH_SUCCESS
            };
        }
    }
    async getAllHospitals() {
        try {
            const hospitals = await this._adminRepo.findAll();
            return hospitals.filter(admin => admin.isActive).map(admin => {
                const { password, ...safeAdmin } = admin.toObject();
                return safeAdmin;
            });
        }
        catch (error) {
            throw {
                status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
                message: error.message || "Failed to fetch hospitals"
            };
        }
    }
}
