import { Request, Response, NextFunction } from "express";
import { IDoctorSalaryService } from "../../../../services/hospital/doctor/interfaces/doctor.salary.service.interface.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";

export class DoctorSalaryController {
  constructor(private readonly _doctorSalaryService: IDoctorSalaryService) {}

  async getDoctorSalaryRequests(
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> {
    try { 
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        throw new Error("Hospital ID not found");
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const statusFilter = req.query.status as string; 
      
      const { data, total, totalPages } = await this._doctorSalaryService.getDoctorSalaryRequests(hospital_id, page, limit, search, statusFilter);
      
      ApiResponse.success(
        res,
        "Doctor salary requests fetched successfully",
        data,
        200,
        {
          page,
          limit,
          totalItems: total,
          totalPages,
          currentPage: page
        }
      );
    } catch (error) {
      console.error("Controller: Error fetching doctor salary requests", error);
      next(error); 
    }
  }

  async updateSalaryRequestStatus(
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, approvedAmount, note, hospitalCommission ,doctorId} = req.body;
        const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        throw new Error("Hospital ID not found");
      }

      if (!status || !note) {
        throw new Error("Status and note are required");
      }

      const result = await this._doctorSalaryService.updateSalaryRequestStatus(id, hospital_id,status, { approvedAmount, note, hospitalCommission, doctorId });

      ApiResponse.success(
        res,
        `Doctor salary request ${status.toLowerCase()} successfully`,
        result
      );
    } catch (error) {
      console.error("Controller: Error updating doctor salary request status", error);
      next(error);
    }
  }
}