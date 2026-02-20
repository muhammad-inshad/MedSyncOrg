import { NextFunction, Request, Response } from "express";
import { DoctorService } from "../services/doctor.service.ts";

class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }


  getme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorID = (req as any).user.userId;
      const doctor = await this.doctorService.getDoctorProfile(doctorID);
      return res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error: any) {
      next(error);
    }
  };

  doctorEdit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const files = (req as any).files as { [fieldname: string]: any[] };
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
      return res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        data: updatedDoctor
      });
    } catch (error: any) {
      next(error);
    }
  };

  reapplyDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.doctorService.reapply(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Doctor re-application submitted",
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export default DoctorController;