class DoctorController {
    constructor(doctorService) {
        this.doctorService = doctorService;
        this.RegistorDoctor = async (req, res) => {
            try {
                const files = req.files;
                const doctor = await this.doctorService.registerDoctor(req.body, files);
                return res.status(201).json({
                    success: true,
                    message: "Doctor registered successfully",
                    data: doctor,
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to register doctor",
                });
            }
        };
        this.loginDoctor = async (req, res) => {
            try {
                const result = await this.doctorService.loginDoctor(req.body);
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
                    message: "Doctor login successful",
                    data: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        user: {
                            ...result.user,
                            role: "doctor"
                        }
                    }
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Login failed",
                });
            }
        };
        this.getme = async (req, res) => {
            try {
                const doctorID = req.user.userId;
                const doctor = await this.doctorService.getDoctorProfile(doctorID);
                return res.status(200).json({
                    success: true,
                    data: doctor,
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to fetch doctor",
                });
            }
        };
        this.doctorEdit = async (req, res) => {
            try {
                const { id } = req.params;
                const files = req.files;
                const updateData = { ...req.body };
                if (typeof updateData.consultationTime === 'string') {
                    try {
                        updateData.consultationTime = JSON.parse(updateData.consultationTime);
                    }
                    catch (error) {
                        console.error('Error parsing consultationTime:', error);
                    }
                }
                if (typeof updateData.payment === 'string') {
                    try {
                        updateData.payment = JSON.parse(updateData.payment);
                    }
                    catch (error) {
                        console.error('Error parsing payment:', error);
                    }
                }
                if (files?.profileImage?.[0]) {
                    updateData.profileImageFile = files.profileImage[0];
                }
                if (files?.license?.[0]) {
                    updateData.licenseFile = files.license[0];
                }
                const updatedDoctor = await this.doctorService.updateDoctorProfile(id, updateData);
                return res.status(200).json({
                    success: true,
                    message: "Doctor updated successfully",
                    data: updatedDoctor
                });
            }
            catch (error) {
                console.error("Controller Error:", error);
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to update doctor"
                });
            }
        };
        this.reapplyDoctor = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.doctorService.reapply(id, req.body);
                return res.status(200).json({
                    success: true,
                    message: "Doctor re-application submitted",
                    data: result
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to re-apply"
                });
            }
        };
    }
}
export default DoctorController;
