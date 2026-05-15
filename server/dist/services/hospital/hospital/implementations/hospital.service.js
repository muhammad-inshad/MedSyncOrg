import { MESSAGES } from "../../../../constants/messages.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { SelectedHospitalSchema } from "../../../../dto/hospital/hospital-response.dto.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import Logger from "../../../../utils/logger.js";
import bcrypt from "bcryptjs";
export class HospitalService {
    constructor(_hospitalRepo, _hospitalMapper, _imageService, _patientService, _doctorRepo, _departmentRepo, _userRepo, _subscriptionRepo) {
        this._hospitalRepo = _hospitalRepo;
        this._hospitalMapper = _hospitalMapper;
        this._imageService = _imageService;
        this._patientService = _patientService;
        this._doctorRepo = _doctorRepo;
        this._departmentRepo = _departmentRepo;
        this._userRepo = _userRepo;
        this._subscriptionRepo = _subscriptionRepo;
    }
    async getHospitalProfile(hospitalId) {
        const hospital = await this._hospitalRepo.findById(hospitalId);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.ADMIN.NOT_FOUND);
        }
        const [doctors, patients, departments] = await Promise.all([
            this._doctorRepo.countDocuments({ hospital_id: hospitalId }),
            this._userRepo.countDocuments({ hospital_id: hospitalId }),
            this._departmentRepo.countDocuments({ hospital_id: hospitalId })
        ]);
        const currentCounts = { doctors, patients, departments };
        let limits;
        if (hospital.subscription?.plan) {
            const planName = hospital.subscription.plan.charAt(0).toUpperCase() + hospital.subscription.plan.slice(1);
            await this._subscriptionRepo.findByPlanName(planName);
        }
        return this._hospitalMapper.toDTO(hospital, limits, currentCounts);
    }
    async getSelectedHospital(hospitalId, page = 1, limit = 10, search = "") {
        const data = await this._patientService.selectedHospital(hospitalId, page, limit, search);
        return SelectedHospitalSchema.parse(data);
    }
    async updateHospitalStatusReapply(hospitalId) {
        const updatedHospital = await this._hospitalRepo.update(hospitalId, {
            reviewStatus: "pending",
            rejectionReason: undefined
        });
        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }
    async updateHospital(hospitalId, hospitalData, files) {
        const hospital = await this._hospitalRepo.findById(hospitalId);
        if (!hospital) {
            Logger.warn(`Update Hospital failed: Hospital not found with ID ${hospitalId}`);
            return null;
        }
        const updatePayload = { ...hospitalData };
        if (updatePayload.password && updatePayload.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
        }
        else {
            delete updatePayload.password;
        }
        try {
            if (typeof updatePayload.subscription === "string") {
                updatePayload.subscription = JSON.parse(updatePayload.subscription);
            }
            if (typeof updatePayload.images === "string") {
                updatePayload.images = JSON.parse(updatePayload.images);
            }
            if (typeof updatePayload.since === "string") {
                updatePayload.since = parseInt(updatePayload.since, 10);
            }
        }
        catch (error) {
            Logger.error("Error parsing JSON fields in hospital update", error);
        }
        const currentImages = hospital.images || {
            landscape: [],
            medicalTeam: [],
            patientCare: [],
            services: [],
        };
        const desiredImages = updatePayload.images || currentImages;
        if (typeof updatePayload.logo === "string" && updatePayload.logo.startsWith("data:image")) {
            if (hospital.logo)
                await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = await this._imageService.uploadImage(updatePayload.logo, "hospitals/logos");
        }
        else if (updatePayload.logo === "" && hospital.logo) {
            await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = "";
        }
        else if (files?.logo?.[0]) {
            if (hospital.logo)
                await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = await this._imageService.uploadImage(files.logo[0].buffer, "hospitals/logos");
        }
        if (typeof updatePayload.licence === "string" && updatePayload.licence.startsWith("data:image")) {
            if (hospital.licence)
                await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = await this._imageService.uploadImage(updatePayload.licence, "hospitals/licenses");
        }
        else if (updatePayload.licence === "" && hospital.licence) {
            await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = "";
        }
        else if (files?.licence?.[0]) {
            if (hospital.licence)
                await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = await this._imageService.uploadImage(files.licence[0].buffer, "hospitals/licenses");
        }
        const categories = ["landscape", "medicalTeam", "patientCare", "services"];
        updatePayload.images = { ...currentImages };
        for (const category of categories) {
            const currentUrls = currentImages[category] || [];
            const desiredState = desiredImages[category] || [];
            let finalState = [...desiredState];
            if (files?.[category]) {
                const uploadedUrls = await Promise.all(files[category].map(file => this._imageService.uploadImage(file.buffer, `hospitals/gallery/${category}`)));
                finalState = [...finalState, ...uploadedUrls];
            }
            updatePayload.images[category] =
                await this._imageService.processGalleryUpdate(currentUrls, finalState, `hospitals/gallery/${category}`);
        }
        if (updatePayload.subscription &&
            typeof updatePayload.subscription !== "string") {
            const subscription = updatePayload.subscription;
            if (subscription.plan) {
                const planDetails = await this._subscriptionRepo.findByPlanName(subscription.plan);
                if (planDetails) {
                    const startDate = subscription.startDate
                        ? new Date(subscription.startDate)
                        : new Date();
                    subscription.startDate = startDate;
                    subscription.endDate = this.calculateSubscriptionEndDate(startDate, planDetails.duration || 1, planDetails.durationUnit || "months");
                }
            }
        }
        Logger.info(`Updating hospital profile for ID: ${hospitalId}`);
        const updatedHospital = await this._hospitalRepo.update(hospitalId, updatePayload);
        return updatedHospital
            ? this._hospitalMapper.toDTO(updatedHospital)
            : null;
    }
    calculateSubscriptionEndDate(startDate, duration, unit) {
        const endDate = new Date(startDate);
        switch (unit) {
            case 'days':
                endDate.setDate(endDate.getDate() + duration);
                break;
            case 'months':
                endDate.setMonth(endDate.getMonth() + duration);
                break;
            case 'years':
                endDate.setFullYear(endDate.getFullYear() + duration);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + duration);
        }
        return endDate;
    }
}
