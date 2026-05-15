import logger from "../../utils/logger.js";
import { HttpStatusCode } from "../../constants/enums.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
class DoctorController {
    constructor(_doctorService) {
        this._doctorService = _doctorService;
        this.getme = async (req, res, next) => {
            try {
                const user = req.user;
                const doctorID = user?.doctorID || user?.userId;
                if (!doctorID) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const doctor = await this._doctorService.getDoctorProfile(doctorID);
                return res.status(HttpStatusCode.OK).json({
                    success: true,
                    data: doctor,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDoctor = async (req, res, next) => {
            try {
                const id = req.user?.doctorID || req.user?.userId;
                if (!id) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const files = req.files;
                const updateData = { ...req.body };
                if (typeof updateData.consultationTime === 'string') {
                    try {
                        updateData.consultationTime = JSON.parse(updateData.consultationTime);
                    }
                    catch (error) {
                        logger.error('Error parsing consultationTime:', error);
                    }
                }
                if (typeof updateData.payment === 'string') {
                    try {
                        updateData.payment = JSON.parse(updateData.payment);
                    }
                    catch (error) {
                        logger.error('Error parsing payment:', error);
                    }
                }
                if (files?.profileImage?.[0]) {
                    updateData.profileImageFile = files.profileImage[0];
                }
                if (files?.license?.[0]) {
                    updateData.licenseFile = files.license[0];
                }
                const updatedDoctor = await this._doctorService.updateDoctorProfile(id, updateData);
                return res.status(HttpStatusCode.OK).json({
                    success: true,
                    message: "Doctor updated successfully",
                    data: updatedDoctor
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.reapplyDoctor = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await this._doctorService.reapply(id);
                return res.status(HttpStatusCode.OK).json({
                    success: true,
                    message: "Doctor re-application submitted",
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.applyLeave = async (req, res, next) => {
            try {
                const user = req.user;
                const doctorId = user?.doctorID || user?.userId;
                if (!doctorId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const { startDate, endDate, leaveSession, reason, photo: bodyPhoto } = req.body;
                const filePhoto = req.file;
                const photo = filePhoto || bodyPhoto;
                const result = await this._doctorService.applyLeave(doctorId, {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    leaveSession: (leaveSession || undefined),
                    reason,
                    photo
                });
                return ApiResponse.success(res, "Leave application submitted successfully", result, HttpStatusCode.CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorLeaves = async (req, res, next) => {
            try {
                const user = req.user;
                const doctorId = user?.doctorID || user?.userId;
                if (!doctorId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const { page = 1, limit = 5, startDate, endDate } = req.query;
                const result = await this._doctorService.getDoctorLeaves({
                    doctorId,
                    page: Number(page),
                    limit: Number(limit),
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined
                });
                return ApiResponse.success(res, "Leaves fetched successfully", result.data, HttpStatusCode.OK, {
                    page: result.page,
                    limit: result.limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / result.limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
export default DoctorController;
