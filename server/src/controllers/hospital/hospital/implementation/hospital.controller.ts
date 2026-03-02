import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { ITokenPayload } from "../../../../services/token/token.service.interface.ts";
import { IHospitalController } from "../interfaces/hospital.controller.interface.ts";
import { IHospitalService } from "../../../../services/hospital/hospital/interfaces/hospital.services.interfaces.ts";

export class HospitalController implements IHospitalController {
    constructor(private readonly _hospitalService: IHospitalService) { }

    async getHospitalProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user as unknown as ITokenPayload;
            const hospitalId = user.userId;
            const result = await this._hospitalService.getHospitalProfile(hospitalId);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, result);
        } catch (error: unknown) {
            next(error);
        }
    }

    async reapply(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = req.user as unknown as ITokenPayload;
            const hospitalId = user.userId;
            const result = await this._hospitalService.updateHospitalStatusReapply(hospitalId);
            return ApiResponse.success(res, "Re-application submitted successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    }

    async updateHospital(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const hospitalData = req.body;
            const result = await this._hospitalService.updateHospital(id, hospitalData);
            return ApiResponse.success(res, MESSAGES.ADMIN.UPDATE_SUCCESS, result);
        } catch (error: unknown) {
            next(error);
        }
    }
}