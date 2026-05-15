import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { MESSAGES } from "../../../../constants/messages.js";
export class SuperAdminPatientManagementController {
    constructor(_patientService) {
        this._patientService = _patientService;
        this.getPatients = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                const status = req.query.status || "All";
                const result = await this._patientService.getAllPatients({ page, limit, search, status });
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
        this.togglePatientActive = async (req, res, next) => {
            try {
                const { id, isActive } = req.body;
                if (!id) {
                    return ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Patient ID is required");
                }
                const result = await this._patientService.togglePatientActive(id, isActive);
                return ApiResponse.success(res, "Patient status updated successfully", result);
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
            const result = await this._patientService.addPatient(patientData, hospital_id, patientFile);
            return ApiResponse.created(res, "Patient added successfully", result);
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
            const result = await this._patientService.updatePatient(id, patientData, patientFile);
            return ApiResponse.success(res, "Patient updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
}
