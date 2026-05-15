import bcrypt from "bcryptjs";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../../../utils/cloudinaryUpload.js";
import { Types } from "mongoose";
export class SuperAdminPatientManagementService {
    constructor(_userRepo, _patientMapper) {
        this._userRepo = _userRepo;
        this._patientMapper = _patientMapper;
    }
    async getAllPatients(options) {
        const { page, limit, search, status } = options;
        const filter = {};
        if (status?.toLowerCase() === "active") {
            filter.isActive = true;
        }
        else if (status?.toLowerCase() === "inactive") {
            filter.isActive = false;
        }
        const result = await this._userRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email"],
            filter
        });
        return {
            data: result.data.map(p => this._patientMapper.toDTO(p)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
    async togglePatientActive(id, isActive) {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        const updated = await this._userRepo.update(id, { isActive });
        return updated ? this._patientMapper.toDTO(updated) : null;
    }
    async addPatient(data, hospital_id, file) {
        const existingPatient = await this._userRepo.findByEmail(data.email);
        if (existingPatient) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, "Patient already exists with this email");
        }
        let imageUrl = "";
        if (file) {
            imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
        }
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : "";
        const patientData = {
            ...data,
            password: hashedPassword,
            hospital_id: [new Types.ObjectId(hospital_id)],
            image: imageUrl,
            isActive: true,
            isProfileComplete: true,
        };
        const created = await this._userRepo.create(patientData);
        return this._patientMapper.toDTO(created);
    }
    async updatePatient(id, data, file) {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        let imageUrl = patient.image || "";
        const shouldRemoveImage = data.willRemoveImage === "true" || data.willRemoveImage === true;
        if (file || shouldRemoveImage) {
            if (patient.image) {
                await deleteFromCloudinary(patient.image);
            }
            imageUrl = "";
        }
        if (file) {
            imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
        }
        const updateData = { ...data };
        delete updateData.willRemoveImage;
        const updated = await this._userRepo.update(id, {
            ...updateData,
            image: imageUrl,
        });
        return updated ? this._patientMapper.toDTO(updated) : null;
    }
}
