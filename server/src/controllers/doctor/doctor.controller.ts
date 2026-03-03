import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../constants/enums.ts";

import { DoctorService } from "../../services/doctor/doctor.service.ts";

import { DoctorUploadFiles } from "../../types/doctor.types.ts";
import { ITokenPayload } from "../../services/token/token.service.interface.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";

class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }


  getme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const doctorID = user?.userId;
      if (!doctorID) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }
      const doctor = await this.doctorService.getDoctorProfile(doctorID);
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
      const { id } = req.params;
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

      const updatedDoctor = await this.doctorService.updateDoctorProfile(id, updateData);
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
      const result = await this.doctorService.reapply(id);
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Doctor re-application submitted",
        data: result
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export default DoctorController;