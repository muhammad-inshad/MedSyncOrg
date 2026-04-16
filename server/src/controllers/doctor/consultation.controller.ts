import { Request, Response } from "express";
import { IAppointments } from "../../services/doctor/interfaces/appointment.service.interfaces.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import logger from "../../utils/logger.ts";

import { AppointmentStatus } from "../../models/appointment.ts";

export class Consultation {
    constructor(private readonly _appointmentService: IAppointments) { }

    getConsultation = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return ApiResponse.unauthorized(res, "Doctor not authenticated");
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { appointments, total } = await this._appointmentService.getTodayConsultations(userId, { page, limit });
            return ApiResponse.success(
                res,
                "Consultations fetched successfully",
                { appointments, total },
                HttpStatusCode.OK
            );
        } catch (error) {
            logger.error("Error in getConsultation:", error);
            return ApiResponse.error(res, "Failed to fetch consultations");
        }

    }

    markAsCompleted = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updated = await this._appointmentService.updateStatus(id, AppointmentStatus.COMPLETED);

            if (!updated) {
                return ApiResponse.error(res, "Failed to update appointment status");
            }

            return ApiResponse.success(
                res,
                "Appointment marked as completed successfully",
                updated,
                HttpStatusCode.OK
            );
        } catch (error) {
            logger.error("Error in markAsCompleted:", error);
            return ApiResponse.error(res, "Failed to mark appointment as completed");
        }

    }

    prescription = async (req: Request, res: Response) => {
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

            return ApiResponse.success(
                res,
                "Prescription saved successfully",
                updated,
                HttpStatusCode.OK
            );
        } catch (error) {
            logger.error("Error in savePrescription:", error);
            return ApiResponse.error(res, "Failed to save prescription");
        }

    }
}