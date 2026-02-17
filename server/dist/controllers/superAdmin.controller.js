export class SuperAdminController {
    constructor(service) {
        this.service = service;
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Email and password are required"
                    });
                }
                const result = await this.service.login(email, password);
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
                    message: "Superadmin login successful",
                    data: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        user: result.user
                    }
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to login"
                });
            }
        };
        this.hospitalManagement = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const search = req.query.search;
                const result = await this.service.hospitalManagement({ page, limit, search });
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to fetch hospital management data"
                });
            }
        };
        this.getme = async (req, res) => {
            try {
                const superAdminId = req.user.userId;
                const superAdmin = await this.service.getme(superAdminId);
                return res.status(200).json({
                    success: true,
                    data: superAdmin
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to fetch super admin details"
                });
            }
        };
        this.setActive = async (req, res) => {
            try {
                const { id, isActive } = req.body;
                if (!id || isActive === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required parameters: id and isActive"
                    });
                }
                const result = await this.service.setActive(id, isActive);
                return res.status(200).json({
                    success: true,
                    message: "Hospital status updated successfully",
                    data: result
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to update hospital status"
                });
            }
        };
    }
}
