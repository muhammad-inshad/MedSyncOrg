import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import { MESSAGES } from "../../constants/messages.js";

import { IPatientService } from "../../services/patient/interfaces/patient.service.interfaces.js";
import { ITokenPayload } from "../../services/token/token.service.interface.js";
import logger from "../../utils/logger.js";


class PatientController {
  constructor(private readonly patientService: IPatientService) { }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const userId = user?.userId;
     
      if (!userId) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
      }
      const patient = await this.patientService.getProfile(userId);
 
      return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, patient);
    } catch (error: unknown) {
      next(error);
    }
  };


  updatePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const id = req.user.userId;
      const updatedPatient = await this.patientService.updateProfile(id, req.body);
      return ApiResponse.success(res, MESSAGES.PATIENT.UPDATE_SUCCESS, updatedPatient);
    } catch (error: unknown) {
      next(error);
    }
  };

  getAllPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = (req.query.search as string) || "";
      const result = await this.patientService.getAllPatient({ page, limit, search });
      return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getHospitals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 6;
      const search = (req.query.search as string) || "";
      const result = await this.patientService.gethospitals(page, limit, search);
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, {
        hospitals: result.data,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const id = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      await this.patientService.changePassword(id, currentPassword, newPassword);
      return ApiResponse.success(res, "Password changed successfully");
    } catch (error: unknown) {
      next(error);
    }
  };

  selectedHospital = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = (req.query.search as string) || "";
      const hospital = await this.patientService.selectedHospital(id, page, limit, search);
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospital);
    } catch (error: unknown) {
      next(error);
    }
  };

  getdepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug("Fetching departments in PatientController");
    } catch (error) {
      next(error)
    }
  }
  getDoctorDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = (req.query.search as string) || "";
      const doctor = await this.patientService.getDoctorDepartment(id, page, limit, search);
      return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor)
    } catch (error) {
      next(error)
    }
  }

  getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const doctor = await this.patientService.getDoctorById(id);
      return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor);
    } catch (error) {
      next(error);
    }
  };

  getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
  
      const slots = await this.patientService.getAvailableSlots(doctorId, date as string);
      
      return ApiResponse.success(res, "Slots fetched successfully", slots);
    } catch (error) {
      next(error);
    }
  };

  bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const patientId = user?.userId;
      if (!patientId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
      }
      console.log(patientId,req.body)
     await this.patientService.bookAppointment(patientId, req.body);
      return ApiResponse.success(res, "Appointment booked successfully", null, HttpStatusCode.CREATED);
    } catch (error) {
      next(error);
    }
  };

  checkDuplicateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId, date, patient } = req.body;
      const duplicate = await this.patientService.checkDuplicateAppointment(doctorId, date, patient);
      return ApiResponse.success(res, "Duplicate check completed", duplicate);
    } catch (error) {
      next(error);
    }
  };


  getAppoimentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const patientId = req.user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = (req.query.search as string) || "";
      if (!patientId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
      }
      const result = await this.patientService.getAppoimentHistory(patientId, { page, limit, search })
      return ApiResponse.success(res, "Appointment history fetched successfully", result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      next(error);
    }
  }
 
  getTodayAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const patientId = user?.userId;
      if (!patientId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
      }
      const appointments = await this.patientService.getTodayAppointments(patientId);
      return ApiResponse.success(res, "Today's appointments fetched successfully", appointments);
    } catch (error) {
      next(error);
    }
  }

  appoinmentCancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const { reason } = req.body;
      await this.patientService.cancelAppointment({ id, reason });
      return ApiResponse.success(res, MESSAGES.UPDATION.UPDATE)
    } catch (error) {
      next(error)
    }
  }

  checkAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const exists = await this.patientService.checkAppointmentStatus(sessionId);
      return ApiResponse.success(res, "Appointment status checked", { exists });
    } catch (error) {
      next(error);
    }
  };

  getPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;    
      const patientId = user?.userId;
      if (!patientId) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = (req.query.search as string) || "";
      const result = await this.patientService.getPrescriptions(patientId, { page, limit, search });
      return ApiResponse.success(res, "Prescriptions fetched successfully", result.data, HttpStatusCode.OK, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      next(error);
    }

}
getDoctorFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;
    const fee = await this.patientService.getDoctorFee(doctorId);
    return ApiResponse.success(res, "Doctor fee fetched successfully", { fee });
  } catch (error) {
    next(error);
  }
}

getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as unknown as ITokenPayload;  
    const patientId = user?.userId;
    if (!patientId) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const wallet = await this.patientService.getWallet(patientId);
    return ApiResponse.success(res, "Wallet fetched successfully", wallet);
  } catch (error) {
    next(error);
  }
}

addToWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as unknown as ITokenPayload;  
    const patientId = user?.userId;
    if (!patientId) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const { amount } = req.body;
    await this.patientService.addToWallet(patientId, amount);
    return ApiResponse.success(res, "Amount added to wallet successfully");
  } catch (error) {
    next(error);
  }
}
withdrawFromWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as unknown as ITokenPayload;
    const patientId = user?.userId;
    if (!patientId) {
      return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
    }
    const { amount } = req.body;
    await this.patientService.withdrawFromWallet(patientId, amount);
    return ApiResponse.success(res, "Amount withdrawn from wallet successfully");
  } catch (error) {
    next(error);
  }
}

}
export default PatientController;