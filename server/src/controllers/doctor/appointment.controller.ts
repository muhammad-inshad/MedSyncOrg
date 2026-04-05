import { IAppointments } from "../../services/doctor/interfaces/appointment.service.interfaces.ts";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { ITokenPayload } from "../../dto/auth/token-payload.dto.ts";

export class AppointmentController {
  constructor(private readonly _appointmentService: IAppointments) { }

  getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
         const user = req.user as unknown as ITokenPayload;
            const doctorId = user?.doctorID || user?.userId;
            if (!doctorId) {
              return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
            }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || "";
      const date = req.query.date as string;

      const { appointments, total } = await this._appointmentService.getUpcomingAppointments(doctorId, {
        page,
        limit,
        search,
        date
      });
console.log(date,"hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
      return ApiResponse.success(res, "Upcoming appointments fetched successfully", appointments, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}