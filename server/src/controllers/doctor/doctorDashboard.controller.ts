import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { IdoctorDashbord } from "../../services/doctor/interfaces/doctorDashbord.service.interfaces.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { AppError } from "../../errors/app.error.ts";
import { ITokenPayload } from "../../dto/auth/token-payload.dto.ts";


export class DoctorDashboard{
    constructor(private readonly _service:IdoctorDashbord){}
SALARY_INCREASE_REQUEST = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await this._service.salaryincreserequest(req.body);
    return ApiResponse.success(
      res,
      "Request successfully added",result,
      HttpStatusCode.OK
    );
  } catch (error: unknown) {
      if (error instanceof AppError) {
        return ApiResponse.error(res, error.message, error);
      }
    return ApiResponse.error(res, "Failed to request salary hike", error);
  }
};

GET_SALARY_INCREASE_REQUEST = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.query.doctorId as string;
    if (!doctorId) {
      throw new AppError("Doctor ID is required", HttpStatusCode.BAD_REQUEST);
    }
    const result = await this._service.getsalaryincreserequest(doctorId);
    return ApiResponse.success(
      res,
      "Salary increase request fetched successfully",
      result,
      HttpStatusCode.OK
    );
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error);
    }
    return ApiResponse.error(res, "Failed to fetch salary hike request", error);
  }
};

GET_WALLET = async (  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
     const user = req.user as unknown as ITokenPayload;
     const doctorID = user?.doctorID || user?.userId;
      if (!doctorID) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }
    const result = await this._service.getwallet(doctorID); 
      return ApiResponse.success(res, "Wallet information fetched successfully", result, HttpStatusCode.OK);
  } catch (error: unknown) {
    throw new AppError("Failed to fetch wallet information", HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}

WITHDRAW = async (  req: Request,
  res: Response,
  next: NextFunction) => {  
  try {     const user = req.user as unknown as ITokenPayload;
     const doctorID = user?.doctorID || user?.userId; 
      if (!doctorID) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
      }
    const result = await this._service.withdraw(doctorID,req.body.amount);
    
      return ApiResponse.success(res, "Withdrawal request submitted successfully", result, HttpStatusCode.OK);
  } catch (error: unknown) {
    throw new AppError("Failed to process withdrawal request", HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}
}