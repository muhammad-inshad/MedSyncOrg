import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";

class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  RegistorDoctor = async (req: Request, res: Response) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files = (req as any).files as { [fieldname: string]: any[] };
      const doctor = await this.doctorService.registerDoctor(
        req.body,
        files
      );

      return res.status(201).json({
        success: true,
        message: "Doctor registered successfully",
        data: doctor,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to register doctor",
      });
    }
  };

  loginDoctor = async (req: Request, res: Response) => {
    try {
      const result = await this.doctorService.loginDoctor(req.body);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });
      return res.status(200).json({
        success: true,
        message: "Doctor login successful",
        user: {
          ...result.user,
          role: "doctor"
        }
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  };
  getme = async (req: Request, res: Response) => {
    try {
      const doctorID = (req as any).user.userId;
      const doctor = await this.doctorService.getDoctorProfile(doctorID);
      return res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch doctor",
      });
    }
  };
  doctorEdit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(id)
      console.log(id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files = (req as any).files as { [fieldname: string]: any[] };
      // Combine body and files for the service, or handle files explicitly
      // The current service expects data:image strings or we need to update the service to handle buffers.
      // Let's passed files separately or process them here.
      // Based on registerDoctor, we should probably handle files in the service.
      // But updateDoctorProfile signature is (id: string, updateData: any).
      // We will pass files inside updateData or change signature.
      // Let's pass them as part of updateData for now to match current service logic which expects profileImage/licenseImage

      const updateData = { ...req.body };

      // Parse nested JSON fields if they come as strings (from FormData)
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
        // If service expects base64/url, we might need to upload here or change service.
        // Service line 127 checks for startswith('data:image').
        // We should change service to handle file buffers like registerDoctor does.
        // For now, let's pass the files in a way the service can handle
        updateData.profileImageFile = files.profileImage[0];
      }
      if (files?.license?.[0]) {
        updateData.licenseFile = files.license[0];
      }

      const updatedDoctor = await this.doctorService.updateDoctorProfile(id, updateData);
      console.log(updatedDoctor)
      return res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        data: updatedDoctor
      });
    } catch (error: any) {
      console.error("Controller Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update doctor"
      });
    }
  };

  reapplyDoctor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.doctorService.reapply(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Doctor re-application submitted",
        data: result
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to re-apply"
      });
    }
  };
}

export default DoctorController;