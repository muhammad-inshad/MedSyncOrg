import type { Request, Response } from "express";
import { DoctorManagementService } from "../services/doctorManagement.service.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";

export class DoctorManagementController {
  private readonly _doctorManagementService: DoctorManagementService;

  constructor(doctorManagementService: DoctorManagementService) {
    this._doctorManagementService = doctorManagementService;
  }

  async editHospital(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log(updateData)
      const result = await this._doctorManagementService.updateHospital(id, updateData);
console.log(result)
      return res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.ADMIN.UPDATE_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async getAllDoctors(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = req.query.search as string;
      const filterStr = req.query.filter as string;
      let filter = {};

      if (filterStr && filterStr !== 'all') {
        filter = { reviewStatus: filterStr };
      }

      const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });

      return res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.DOCTOR.FETCH_SUCCESS,
        data: result.data,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error: any) {
      console.error("Error in getAllDoctors:", error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.SERVER.ERROR
      });
    }
  }

  async doctorsToggle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedDoctor = await this._doctorManagementService.toggleDoctorStatus(id);
      return res.status(StatusCode.OK).json({
        success: true,
        message: `Doctor ${updatedDoctor?.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedDoctor
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || MESSAGES.SERVER.ERROR
      });
    }
  }

  async acceptDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedDoctor = await this._doctorManagementService.acceptDoctor(id);
      return res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.DOCTOR.VERIFIED,
        data: updatedDoctor
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || MESSAGES.SERVER.ERROR
      });
    }
  }

  async rejectDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const updatedDoctor = await this._doctorManagementService.rejectDoctor(id, reason);
      return res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.DOCTOR.REJECTED,
        data: updatedDoctor
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || MESSAGES.SERVER.ERROR
      });
    }
  }

  async requestRevisionDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const updatedDoctor = await this._doctorManagementService.requestRevision(id, reason);
      return res.status(StatusCode.OK).json({
        success: true,
        message: "Revision requested successfully",
        data: updatedDoctor
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || MESSAGES.SERVER.ERROR
      });
    }
  }

  async reapplyHospital(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.reapplyHospital(id);
      return res.status(StatusCode.OK).json({
        success: true,
        message: "Re-application submitted successfully",
        data: result
      });
    } catch (error: any) {
      return res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || MESSAGES.SERVER.ERROR
      });
    }
  }
}