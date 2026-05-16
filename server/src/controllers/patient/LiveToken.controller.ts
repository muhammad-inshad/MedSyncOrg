import { Request, Response, NextFunction } from "express";
import { Igettoken } from "../../services/patient/interfaces/livetoken.service.interfaces.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import { ITokenPayload } from "../../services/token/token.service.interface.js";

export class LiveTokenController {
    constructor(private readonly _liveTokenService: Igettoken) {}

    getToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as unknown as ITokenPayload;
            const patientId = user?.userId;
            const doctorId = req.query.doctorId as string;

            if (!patientId) {
                return ApiResponse.unauthorized(res, "Patient not authenticated");
            }

            const liveToken = await this._liveTokenService.getPatientLiveToken(patientId, doctorId);
console.log(liveToken)
            if (!liveToken) {
                return ApiResponse.success(
                    res,
                    "No active consultation found for you today",
                    null,
                    HttpStatusCode.OK
                );
            }

            return ApiResponse.success(
                res,
                "Live token fetched successfully",
                liveToken,
                HttpStatusCode.OK
            );
        } catch (error) {
            next(error);
        }
    }
}
