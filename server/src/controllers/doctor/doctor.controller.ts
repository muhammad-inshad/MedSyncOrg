import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../constants/enums.ts";
import { DoctorUploadFiles } from "../../types/doctor.types.ts";
import { ITokenPayload } from "../../services/token/token.service.interface.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { IDoctorService } from "../../services/doctor/interfaces/doctor.service.interfaces.ts";

class DoctorController {
  constructor(private readonly _doctorService: IDoctorService) { }


  getme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const doctorID = user?.doctorID || user?.userId;
      if (!doctorID) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }
      const doctor = await this._doctorService.getDoctorProfile(doctorID);
      return res.status(HttpStatusCode.OK).json({
        success: true,
        data: doctor,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user?.doctorID || req.user?.userId;

      if (!id) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }
      const files = req.files as DoctorUploadFiles | undefined;
      const updateData = { ...req.body };
      if (typeof updateData.consultationTime === 'string') {
        try {
          updateData.consultationTime = JSON.parse(updateData.consultationTime);
        } catch (error) {
          console.error('Error parsing consultationTime:', error);
        }
      }

      if (typeof updateData.payment === 'string') {
        try {
          updateData.payment = JSON.parse(updateData.payment);
        } catch (error) {
          console.error('Error parsing payment:', error);
        }
      }

      if (files?.profileImage?.[0]) {
        updateData.profileImageFile = files.profileImage[0];
      }
      if (files?.license?.[0]) {
        updateData.licenseFile = files.license[0];
      }

      const updatedDoctor = await this._doctorService.updateDoctorProfile(id, updateData);
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Doctor updated successfully",
        data: updatedDoctor
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  reapplyDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._doctorService.reapply(id);
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Doctor re-application submitted",
        data: result
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const doctorId = user?.doctorID || user?.userId;

      if (!doctorId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }

      const { startDate, endDate, leaveSession, reason, photo: bodyPhoto } = req.body;
      const filePhoto = req.file;
      const photo = filePhoto || bodyPhoto;

      const result = await this._doctorService.applyLeave(doctorId, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveSession: (leaveSession || undefined) as "morning" | "afternoon" | "evening" | "night" | undefined,
        reason,
        photo
      });

      return ApiResponse.success(res, "Leave application submitted successfully", result, HttpStatusCode.CREATED);
    } catch (error: unknown) {
      next(error);
    }
  }

  getDoctorLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const doctorId = user?.doctorID || user?.userId;

      if (!doctorId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }

      const { page = 1, limit = 5, startDate, endDate } = req.query;

      const result = await this._doctorService.getDoctorLeaves({
        doctorId,
        page: Number(page),
        limit: Number(limit),
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      return ApiResponse.success(res, "Leaves fetched successfully", result, HttpStatusCode.OK);
    } catch (error: unknown) {
      next(error);
    }
  }

}



export default DoctorController;