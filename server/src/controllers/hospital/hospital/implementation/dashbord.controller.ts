import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { MESSAGES } from "../../../../constants/messages.js";
import { IDashbord } from "../../../../services/hospital/hospital/interfaces/dashbord.services.interfaces.js";

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
      ApiResponse.success(res, MESSAGES.DASHBOARD_STATS_FETCHED, stats);
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

  getWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }

      const wallet = await this._dashbord.getWallet(hospitalId);
      ApiResponse.success(res, "Wallet details fetched successfully", wallet);
    } catch (error) {
      next(error);
    }
  };

  withdraw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }

      const { amount } = req.body;
      const withdrawal = await this._dashbord.withdraw(hospitalId, amount);
      ApiResponse.success(res, "Withdrawal processed successfully", withdrawal);
    } catch (error) {
      next(error);
    }
  };


  getReqcancalation=async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }
     const result=await this._dashbord.getReqcancalation(hospitalId)
     ApiResponse.success(res,"data featched successfully",result)
    } catch (error) {
       next(error)
    }
  }

  approvecancellation=async(req: Request, res: Response, next: NextFunction):Promise<void>=>{
    try {
    const { id } = req.params;
     const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }
    const result=await this._dashbord.approvecancellation(id,hospitalId)
    ApiResponse.success(res,"approve success",result)
    } catch (error) {
      next(error)
    }
  }
  rejectcancellation=async(req: Request, res: Response, next: NextFunction):Promise<void>=>{
    try {
      const {id}=req.params
      const {reason}=req.body
      const result=await this._dashbord.rejectcancellation(id,reason)
      ApiResponse.success(res,"success the reject",result)
    } catch (error) {
        next(error)
    }
  }
}
