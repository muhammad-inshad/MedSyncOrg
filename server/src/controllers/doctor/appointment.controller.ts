import { IAppointments } from "../../services/doctor/interfaces/appointment.service.interfaces.ts";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../constants/enums.ts";

export class AppointmentController {
  constructor(private readonly _appointmentService: IAppointments) { }

  getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || "";
      const date = req.query.date as string;

      const { appointments, total } = await this._appointmentService.getUpcomingAppointments(id, {
        page,
        limit,
        search,
        date
      }) as { appointments: any[]; total: number };

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