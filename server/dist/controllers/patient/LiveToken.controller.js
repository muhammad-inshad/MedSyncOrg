import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
export class LiveTokenController {
    constructor(_liveTokenService) {
        this._liveTokenService = _liveTokenService;
        this.getToken = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                const doctorId = req.query.doctorId;
                if (!patientId) {
                    return ApiResponse.unauthorized(res, "Patient not authenticated");
                }
                const liveToken = await this._liveTokenService.getPatientLiveToken(patientId, doctorId);
                console.log(liveToken);
                if (!liveToken) {
                    return ApiResponse.success(res, "No active consultation found for you today", null, HttpStatusCode.OK);
                }
                return ApiResponse.success(res, "Live token fetched successfully", liveToken, HttpStatusCode.OK);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
