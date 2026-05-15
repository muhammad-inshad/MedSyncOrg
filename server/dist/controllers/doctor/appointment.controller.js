import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import logger from "../../utils/logger.js";
export class AppointmentController {
    constructor(_appointmentService) {
        this._appointmentService = _appointmentService;
        this.getUpcomingAppointments = async (req, res, next) => {
            try {
                const user = req.user;
                const doctorId = user?.doctorID || user?.userId;
                if (!doctorId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                const date = req.query.date;
                const { appointments, total } = await this._appointmentService.getUpcomingAppointments(doctorId, {
                    page,
                    limit,
                    search,
                    date
                });
                logger.debug(`Fetching upcoming appointments for date: ${date}`);
                return ApiResponse.success(res, "Upcoming appointments fetched successfully", appointments, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
