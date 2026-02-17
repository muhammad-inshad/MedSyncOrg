export class AdminController {
    constructor(adminService) {
        this.getAllHospitals = async (req, res) => {
            try {
                const hospitals = await this.adminService.getAllHospitals();
                return res.status(200).json({
                    success: true,
                    data: hospitals,
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to fetch hospitals",
                });
            }
        };
        this.adminService = adminService;
    }
    async signup(req, res) {
        try {
            const adminData = req.body;
            const files = req.files;
            const processedFiles = {
                logo: files?.logo ? files.logo[0] : undefined,
                licence: files?.licence ? files.licence[0] : undefined,
            };
            const result = await this.adminService.signup(adminData, processedFiles);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(error.status || 500).json({
                message: error.message || "Server error",
            });
        }
    }
    async login(req, res) {
        try {
            const data = req.body;
            console.log("ppppppppppppppppppppppppppppppppppp");
            const result = await this.adminService.loginAdmin(data);
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
                path: "/",
            });
            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: { ...result.user, role: "admin" }
                }
            });
        }
        catch (error) {
            res.status(error.status || 500).json({
                message: error.message || "Server error",
            });
        }
    }
    async getme(req, res) {
        try {
            const adminID = req.user.userId;
            const Admin = await this.adminService.getAdminProfile(adminID);
            return res.status(200).json({
                success: true,
                data: Admin,
            });
        }
        catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to fetch Admin",
            });
        }
    }
    ;
}
