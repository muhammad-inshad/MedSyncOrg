class PatientController {
    constructor(patientService) {
        this.patientService = patientService;
        this.getMe = async (req, res) => {
            try {
                const userId = req.user.userId;
                const patient = await this.patientService.getProfile(userId);
                return res.status(200).json({
                    success: true,
                    data: patient,
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Failed to fetch patient",
                });
            }
        };
        this.getAllPatient = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const search = req.query.search || "";
                const result = await this.patientService.getAllPatient({
                    page,
                    limit,
                    search,
                });
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Internal server error",
                });
            }
        };
        this.patientEdit = async (req, res) => {
            try {
                const { id } = req.params;
                const file = req.file;
                const updatedPatient = await this.patientService.updatedPatient(id, req.body);
                return res.status(200).json({
                    success: true,
                    message: "patient updated successfully",
                    data: updatedPatient
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
    }
}
export default PatientController;
