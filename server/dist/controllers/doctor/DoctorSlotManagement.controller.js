import { ApiResponse } from "../../utils/apiResponse.utils.js";
export class DoctorSlotManagementController {
    constructor(slotservice) {
        this.slotservice = slotservice;
        this.createDoctorSchedule = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorSchedules = async (req, res, next) => {
            try {
                const doctorId = req.user?.doctorID || req.user?.userId;
                if (!doctorId) {
                    return ApiResponse.unauthorized(res);
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const result = await this.slotservice.getSchedules(doctorId, page, limit);
                return ApiResponse.success(res, "Schedules fetched successfully", result.data, undefined, {
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                    currentPage: page,
                    limit
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteDoctorSchedule = async (req, res, next) => {
            try {
                const { id } = req.params;
                const doctorId = req.user?.doctorID || req.user?.userId;
                const { status } = req.body;
                if (!doctorId) {
                    return ApiResponse.unauthorized(res);
                }
                await this.slotservice.deleteSchedule(id, doctorId, status);
                return ApiResponse.success(res, "Schedule deleted successfully");
            }
            catch (error) {
                next(error);
            }
        };
    }
}
