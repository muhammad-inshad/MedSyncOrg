import type { Request, Response } from "express";
import { AdminManagementService } from "../service/adminManagement.service";

export class AdminManagementController {
    private adminService: AdminManagementService;

    constructor(adminService: AdminManagementService) {
        this.adminService = adminService;
    }

    async editHospital(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const result = await this.adminService.updateHospital(id, updateData);

            return res.status(200).json({
                success: true,
                message: "Hospital information updated successfully",
                data: result,
            });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

async getalldoctors(req: Request, res: Response) {
  try {
    const doctors = await this.adminService.getAllDoctors();
    return res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors
    });
  } catch (error: any) {
    console.error("Error in getalldoctors:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
}

async doctorsToggle(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const updatedDoctor = await this.adminService.toggleDoctorStatus(id);
console.log(updatedDoctor)
    return res.status(200).json({
      success: true,
      message: `Doctor ${updatedDoctor?.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedDoctor
    });
  } catch (error: any) {
    console.error("Toggle Status Error:", error);
    return res.status(error.message === "Doctor not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
}
}