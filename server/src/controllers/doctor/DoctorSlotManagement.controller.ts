import { Request, Response, NextFunction } from "express";

import { ISlotMangement } from "../../services/doctor/interfaces/slotMangement.service.interfaces.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { PaginationMeta } from "../../interfaces/pagination.ts";

export class DoctorSlotManagementController {
    constructor(private readonly slotservice: ISlotMangement) {}

    createDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user?.doctorID || req.user?.userId;   
            if (!doctorId) {
                return ApiResponse.unauthorized(res, "Doctor ID not found in token");
            }
            const scheduleData = {
                ...req.body,
                doctorId,
            };
            await this.slotservice.createSchedule(scheduleData);

            return ApiResponse.created(res, "Recurring schedule created successfully");
        } catch (error) {
            next(error)
        }
    };

 
    getDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user?.doctorID || req.user?.userId;

            if (!doctorId) {
                return ApiResponse.unauthorized(res);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
        

            const result = await this.slotservice.getSchedules(doctorId, page, limit);

         return ApiResponse.success(
    res,
    "Schedules fetched successfully",
    result.data,
    undefined,
    {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
        currentPage: page,
        limit
    } as PaginationMeta 
);
        }catch (error) {
            next(error)
        }
    };


    updateDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctorId = req.user?.doctorID || req.user?.userId;
            if (!doctorId) {
                return ApiResponse.unauthorized(res, "Doctor ID not found in token");
            }
            const { id } = req.params;
            const scheduleData = {
                ...req.body,
                doctorId,
            };
            await this.slotservice.updateSchedule(id, scheduleData);

            return ApiResponse.success(res, "Recurring schedule updated successfully");
        } catch (error) {
            next(error);
        }
    };

    deleteDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
        try {
         
            const { id } = req.params;
            const doctorId = req.user?.doctorID || req.user?.userId;
            const {status}=req.body
          
            if (!doctorId) {
                return ApiResponse.unauthorized(res);
            }

            await this.slotservice.deleteSchedule(id, doctorId,status);

            return ApiResponse.success(res, "Schedule deleted successfully");
        }catch (error) {
            next(error)
        }
    };
}