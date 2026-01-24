import { Request, Response } from "express";
import { DoctorService } from "../service/doctor.service";

class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  RegistorDoctor = async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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
  res.cookie("accessToken",result.accessToken, {
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
      const updatedDoctor = await this.doctorService.updateDoctorProfile(id, req.body);
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
}

export default DoctorController;