import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { MESSAGES } from "../../../../constants/messages.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
export class PatientManagementController {
    constructor(_patientManagementService) {
        this._patientManagementService = _patientManagementService;
        this.getAllPatient = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                const hospital = req.user;
                const hospital_id = hospital?.userId;
                const filter = req.query.filter;
                const result = await this._patientManagementService.getAllPatient({ page, limit, search, filter, hospital_id });
                return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
    async addPatient(req, res, next) {
        try {
            const hospital = req.user;
            const hospital_id = hospital?.userId;
            if (!hospital_id) {
                return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Hospital ID not found");
            }
            const patientData = req.body;
            const patientFile = req.file;
            const result = await this._patientManagementService.addPatient(patientData, hospital_id, patientFile);
            return ApiResponse.created(res, "Patient added successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async patientsToggle(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this._patientManagementService.patientsToggle(id);
            return ApiResponse.success(res, "Patient status toggled successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePatient(req, res, next) {
        try {
            const { id } = req.params;
            const patientData = req.body;
            const patientFile = req.file;
            const result = await this._patientManagementService.updatePatient(id, patientData, patientFile);
            return ApiResponse.success(res, "Patient updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
}
