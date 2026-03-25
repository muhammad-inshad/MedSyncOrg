import { NextFunction, Request, Response } from "express";
import { IDoctorManagementService } from "../../../../services/hospital/doctor/interfaces/IDoctorManagementService.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { IDoctorManagementController } from "../interfaces/doctor.management.controller.interface.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IDoctorFilter } from "../../../../types/hospital.types.ts";
import { DoctorUploadFiles } from "../../../../types/doctor.types.ts";
import { DoctorDTO } from "../../../../dto/auth/signup.dto.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { FilterQuery } from 'mongoose';
import { IDoctor } from "../../../../models/doctor.model.ts";
import { ITokenPayload } from "../../../../services/token/token.service.interface.ts";
// import { AuthHOspitalPayload } from "../../../../dto/hospital/hospital-response.dto.ts";

export class DoctorManagementController implements IDoctorManagementController {
  constructor(private readonly _doctorManagementService: IDoctorManagementService) { }

  async getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const hospital = req.user;
      const hospital_id = hospital?.userId;

      const filter: IDoctorFilter = {
        reviewStatus: "approved"
      };

      if (hospital_id) {
        filter.hospital_id = hospital_id.toString();
      }
      const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });
      return ApiResponse.success(res, "Doctors fetched successfully", result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getAllKycDoctors = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      // const reviewStatus = req.query.filter as string; // 'all' | 'pending' | 'revision' | 'rejected'

      const hospital = req.user;
      const hospital_id = hospital?.userId;

      const filter: FilterQuery<IDoctor> = {
        licence: { $exists: true, $ne: "" },
        reviewStatus: { $ne: "approved" }
      };

      if (hospital_id) {
        filter.hospital_id = hospital_id.toString();
      }

      const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });
      return ApiResponse.success(res, "KYC Doctors fetched successfully", result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: unknown) {
      next(error);
    }
  };



  async doctorsToggle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.doctorsToggle(id);
      return ApiResponse.success(res, "Doctor status toggled successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async acceptDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.acceptDoctor(id);
      return ApiResponse.success(res, "Doctor accepted successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async rejectDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const  {reason}=req.body
      const result = await this._doctorManagementService.rejectDoctor(id,reason);
      return ApiResponse.success(res, "Doctor rejected successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async requestRevisionDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const  {reason}=req.body
      const result = await this._doctorManagementService.requestRevisionDoctor(id,reason);
      return ApiResponse.success(res, "Doctor revision requested successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async registerDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const files = req.files as unknown as DoctorUploadFiles;
      const doctorData = req.body as DoctorDTO;

      const hospital = req.user;
      const hospital_id = hospital?.userId;

      if (!hospital_id) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Hospital ID not found");
      }

      const doctor = await this._doctorManagementService.registerDoctor(
        doctorData,
        files,
        hospital_id.toString()
      );

      return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
    } catch (error: unknown) {
      next(error);
    }
  }

  async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const files = req.files as unknown as DoctorUploadFiles;
      const doctorData = req.body;
      console.log(doctorData)
      const result = await this._doctorManagementService.updateDoctor(id, doctorData, files);
      return ApiResponse.success(res, "Doctor profile updated successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async getLeaveDoctors(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospitalId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const result = await this._doctorManagementService.getLeaveDoctors({
        hospitalId,
        page,
        limit,
        search,
        date
      });

      return ApiResponse.success(res, "Doctor leaves fetched successfully", result.data, HttpStatusCode.OK, {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  async updateLeaveStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { status, rejectedReason } = req.body;

      if (!status || !['approved', 'rejected'].includes(status)) {
        return ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid status");
      }

      const result = await this._doctorManagementService.updateLeaveStatus(id, status, rejectedReason);
      return ApiResponse.success(res, `Leave ${status} successfully`, result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async getDoctorDetails(req:Request,res:Response):Promise<Response|void>{
    const {id}=req.params
    const result = await this._doctorManagementService.getDoctorDetails(id);
    console.log(result)
    return ApiResponse.success(res,"success",result);
  }

  async getDeptSpecs(req:Request,res:Response,next:NextFunction):Promise<Response|void>{
     try {
        const user = req.user as unknown as ITokenPayload;
      const hospitalId = user.userId;
      const result=await this._doctorManagementService.getDeptSpecs(hospitalId)
      return ApiResponse.success(res,"success",result)
     } catch (error) {
      next(error)
     }
  }

}
