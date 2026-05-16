import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import { MESSAGES } from "../../constants/messages.js";
import logger from "../../utils/logger.js";
class PatientController {
    constructor(patientService) {
        this.patientService = patientService;
        this.getMe = async (req, res, next) => {
            try {
                const user = req.user;
                const userId = user?.userId;
                if (!userId) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
                }
                const patient = await this.patientService.getProfile(userId);
                return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, patient);
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePatient = async (req, res, next) => {
            try {
                if (!req.user) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const id = req.user.userId;
                const updatedPatient = await this.patientService.updateProfile(id, req.body);
                return ApiResponse.success(res, MESSAGES.PATIENT.UPDATE_SUCCESS, updatedPatient);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllPatient = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                const result = await this.patientService.getAllPatient({ page, limit, search });
                return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getHospitals = async (req, res, next) => {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 6;
                const search = req.query.search || "";
                const result = await this.patientService.gethospitals(page, limit, search);
                return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, {
                    hospitals: result.data,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                if (!req.user) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const id = req.user.userId;
                const { currentPassword, newPassword } = req.body;
                await this.patientService.changePassword(id, currentPassword, newPassword);
                return ApiResponse.success(res, "Password changed successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.selectedHospital = async (req, res, next) => {
            try {
                const { id } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || "";
                const hospital = await this.patientService.selectedHospital(id, page, limit, search);
                return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospital);
            }
            catch (error) {
                next(error);
            }
        };
        this.getdepartments = async (req, res, next) => {
            try {
                logger.debug("Fetching departments in PatientController");
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorDepartment = async (req, res, next) => {
            try {
                const { id } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || "";
                const doctor = await this.patientService.getDoctorDepartment(id, page, limit, search);
                return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const doctor = await this.patientService.getDoctorById(id);
                return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAvailableSlots = async (req, res, next) => {
            try {
                const { doctorId } = req.params;
                const { date } = req.query;
                const slots = await this.patientService.getAvailableSlots(doctorId, date);
                return ApiResponse.success(res, "Slots fetched successfully", slots);
            }
            catch (error) {
                next(error);
            }
        };
        this.bookAppointment = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
                }
                console.log(patientId, req.body);
                await this.patientService.bookAppointment(patientId, req.body);
                return ApiResponse.success(res, "Appointment booked successfully", null, HttpStatusCode.CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.checkDuplicateAppointment = async (req, res, next) => {
            try {
                const { doctorId, date, patient } = req.body;
                const duplicate = await this.patientService.checkDuplicateAppointment(doctorId, date, patient);
                return ApiResponse.success(res, "Duplicate check completed", duplicate);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAppoimentHistory = async (req, res, next) => {
            try {
                if (!req.user) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const patientId = req.user.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const result = await this.patientService.getAppoimentHistory(patientId, { page, limit, search });
                return ApiResponse.success(res, "Appointment history fetched successfully", result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTodayAppointments = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const appointments = await this.patientService.getTodayAppointments(patientId);
                console.log(appointments);
                return ApiResponse.success(res, "Today's appointments fetched successfully", appointments);
            }
            catch (error) {
                next(error);
            }
        };
        this.appoinmentCancel = async (req, res, next) => {
            try {
                const id = req.params.id;
                const { reason } = req.body;
                await this.patientService.cancelAppointment({ id, reason });
                return ApiResponse.success(res, MESSAGES.UPDATION.UPDATE);
            }
            catch (error) {
                next(error);
            }
        };
        this.checkAppointmentStatus = async (req, res, next) => {
            try {
                const { sessionId } = req.params;
                const exists = await this.patientService.checkAppointmentStatus(sessionId);
                return ApiResponse.success(res, "Appointment status checked", { exists });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPrescriptions = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search || "";
                const result = await this.patientService.getPrescriptions(patientId, { page, limit, search });
                return ApiResponse.success(res, "Prescriptions fetched successfully", result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorFee = async (req, res, next) => {
            try {
                const { doctorId } = req.params;
                const fee = await this.patientService.getDoctorFee(doctorId);
                return ApiResponse.success(res, "Doctor fee fetched successfully", { fee });
            }
            catch (error) {
                next(error);
            }
        };
        this.getWallet = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const wallet = await this.patientService.getWallet(patientId);
                return ApiResponse.success(res, "Wallet fetched successfully", wallet);
            }
            catch (error) {
                next(error);
            }
        };
        this.addToWallet = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const { amount } = req.body;
                await this.patientService.addToWallet(patientId, amount);
                return ApiResponse.success(res, "Amount added to wallet successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.withdrawFromWallet = async (req, res, next) => {
            try {
                const user = req.user;
                const patientId = user?.userId;
                if (!patientId) {
                    return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
                }
                const { amount } = req.body;
                await this.patientService.withdrawFromWallet(patientId, amount);
                return ApiResponse.success(res, "Amount withdrawn from wallet successfully");
            }
            catch (error) {
                next(error);
            }
        };
    }
}
export default PatientController;
