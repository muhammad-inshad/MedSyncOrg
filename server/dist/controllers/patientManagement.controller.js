export class PatientManagementController {
    constructor(patientservice) {
        this.patientservice = patientservice;
    }
    async patientToggle(req, res) {
        try {
            const { id } = req.params;
            const updatePatient = await this.patientservice.togglePatientStatus(id);
            return res.status(200).json({
                success: true,
                message: `Doctor ${updatePatient?.isActive ? 'activated' : 'deactivated'} successfully`,
                data: updatePatient
            });
        }
        catch (error) {
            return res.status(error.message === "Doctor not found" ? 404 : 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async patientAdd(req, res) {
        try {
            const patientData = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "Profile image is required" });
            }
            const result = await this.patientservice.createPatient(patientData, file);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(500).json({ message: error.message || "Internal sever error" });
        }
    }
}
