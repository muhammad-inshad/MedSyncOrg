import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import logger from "../../utils/logger.js";
import { AppointmentStatus } from "../../models/appointment.js";
export class Consultation {
    constructor(_appointmentService) {
        this._appointmentService = _appointmentService;
        this.getConsultation = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return ApiResponse.unauthorized(res, "Doctor not authenticated");
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const shift = req.query.shift;
                const { appointments, total } = await this._appointmentService.getTodayConsultations(userId, { page, limit, shift });
                return ApiResponse.success(res, "Consultations fetched successfully", { appointments, total }, HttpStatusCode.OK);
            }
            catch (error) {
                logger.error("Error in getConsultation:", error);
                return ApiResponse.error(res, "Failed to fetch consultations");
            }
        };
        this.markAsCompleted = async (req, res) => {
            try {
                const { id } = req.params;
                const updated = await this._appointmentService.updateStatus(id, AppointmentStatus.COMPLETED);
                if (!updated) {
                    return ApiResponse.error(res, "Failed to update appointment status");
                }
                return ApiResponse.success(res, "Appointment marked as completed successfully", updated, HttpStatusCode.OK);
            }
            catch (error) {
                logger.error("Error in markAsCompleted:", error);
                return ApiResponse.error(res, "Failed to mark appointment as completed");
            }
        };
        this.prescription = async (req, res) => {
            try {
                const { appointmentId, medicines, notes } = req.body;
                if (!appointmentId) {
                    return ApiResponse.error(res, "Appointment ID is required");
                }
                const updated = await this._appointmentService.savePrescription(appointmentId, {
                    medicines,
                    notes
                });
                if (!updated) {
                    return ApiResponse.error(res, "Failed to save prescription");
                }
                return ApiResponse.success(res, "Prescription saved successfully", updated, HttpStatusCode.OK);
            }
            catch (error) {
                logger.error("Error in savePrescription:", error);
                return ApiResponse.error(res, "Failed to save prescription");
            }
        };
    }
}
