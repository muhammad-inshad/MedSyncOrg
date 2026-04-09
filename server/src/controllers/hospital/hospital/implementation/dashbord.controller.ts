import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { IDashbord } from "../../../../services/hospital/hospital/interfaces/dashbord.services.interfaces.ts";

export class Dashbord {
  constructor(private readonly _dashbord: IDashbord) {}

  async getstatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }

      const stats = await this._dashbord.getDashboardStats(hospitalId);
      ApiResponse.success(res, "success", stats);
    } catch (error) {
      next(error);
    }
  }

  getDoctorStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return; 
      }

      const status = await this._dashbord.getDoctorStatus(hospitalId);
      ApiResponse.success(res, "Doctor status fetched successfully", status);
    } catch (error) {
      next(error);
    }
  };

  getKycStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }

      const kycStats = await this._dashbord.getKycStats(hospitalId);
      ApiResponse.success(res, "KYC stats fetched successfully", kycStats);
    } catch (error) {
      next(error);
    }
  };

  getCommonStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = req.user?.userId;
      const type= req.query.type as string;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }
      const stats = await this._dashbord.getCommonStats(hospitalId, type);
      ApiResponse.success(res, "Common stats fetched successfully", { stats });
    } catch (error) {
      next(error);
    } 
  };
}
