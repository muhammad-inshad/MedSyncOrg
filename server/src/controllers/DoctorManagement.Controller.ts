import { NextFunction, Request, Response } from "express";
import { IDoctorManagementService } from "../interfaces/IDoctorManagementService.ts";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";

export class DoctorManagementController {
  private readonly _doctorManagementService: IDoctorManagementService;

  constructor(doctorManagementService: IDoctorManagementService) {
    this._doctorManagementService = doctorManagementService;
  }

  async editHospital(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await this._doctorManagementService.updateHospital(id, updateData);
      return ApiResponse.success(res, MESSAGES.ADMIN.UPDATE_SUCCESS, result);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = req.query.search as string;
      const filterStr = req.query.filter as string;
      const isKyc = req.query.isKyc === 'true';
      let filter: any = {};

      if (filterStr && filterStr !== 'all') {
        filter = { reviewStatus: filterStr };
      } else if (isKyc) {
        filter = { reviewStatus: { $in: ['pending', 'revision', 'rejected'] } };
      } else {
        filter = { reviewStatus: 'approved' };
      }

      const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });

      return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error: any) {
      next(error);
    }
  }

  async doctorsToggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedDoctor = await this._doctorManagementService.toggleDoctorStatus(id);
      return ApiResponse.success(res, `Doctor ${updatedDoctor?.isActive ? 'activated' : 'deactivated'} successfully`, updatedDoctor);
    } catch (error: any) {
      next(error);
    }
  }

  async acceptDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedDoctor = await this._doctorManagementService.acceptDoctor(id);
      return ApiResponse.success(res, MESSAGES.DOCTOR.VERIFIED, updatedDoctor);
    } catch (error: any) {
      next(error);
    }
  }

  async rejectDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const updatedDoctor = await this._doctorManagementService.rejectDoctor(id, reason);
      return ApiResponse.success(res, MESSAGES.DOCTOR.REJECTED, updatedDoctor);
    } catch (error: any) {
      next(error);
    }
  }

  async requestRevisionDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const updatedDoctor = await this._doctorManagementService.requestRevision(id, reason);
      return ApiResponse.success(res, "Revision requested successfully", updatedDoctor);
    } catch (error: any) {
      next(error);
    }
  }

  async reapplyHospital(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.reapplyHospital(id);
      return ApiResponse.success(res, "Re-application submitted successfully", result);
    } catch (error: any) {
      next(error);
    }
  }
}