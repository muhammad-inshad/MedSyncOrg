import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import bcrypt from "bcryptjs";
import { PatientMapper } from "../../../../mappers/patient.mapper.ts";
import { IPaginationResult, IPatientFilter } from "../../../../types/hospital.types.ts";
import { PatientResponseDTO, CreatePatientDTO, UpdatePatientDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { ISuperAdminPatientManagementService } from "../interfaces/patient.management.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../../../utils/cloudinaryUpload.ts";
import { IPatient } from "../../../../models/Patient.model.ts";
import { Types, FilterQuery } from "mongoose";

export class SuperAdminPatientManagementService implements ISuperAdminPatientManagementService {
    constructor(
        private readonly _userRepo: IUserRepository,
        private readonly _patientMapper: PatientMapper
    ) { }

    async getAllPatients(options: { page: number; limit: number; search?: string; status?: string }): Promise<IPaginationResult<PatientResponseDTO>> {
        const { page, limit, search, status } = options;
        const filter:IPatientFilter = {};
       if (status?.toLowerCase() === "active") {
  filter.isActive = true;
} else if (status?.toLowerCase() === "inactive") {
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

    async togglePatientActive(id: string, isActive: boolean): Promise<PatientResponseDTO | null> {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        const updated = await this._userRepo.update(id, { isActive });
        return updated ? this._patientMapper.toDTO(updated) : null;
    }

    async addPatient(data: CreatePatientDTO, hospital_id: string, file?: Express.Multer.File): Promise<PatientResponseDTO> {
        const existingPatient = await this._userRepo.findByEmail(data.email!);
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
            hospital_id: new Types.ObjectId(hospital_id),
            image: imageUrl,
            isActive: true,
            isProfileComplete: true,
        };

        const created = await this._userRepo.create(patientData as IPatient);
        return this._patientMapper.toDTO(created);
    }

    async updatePatient(id: string, data: UpdatePatientDTO, file?: Express.Multer.File): Promise<PatientResponseDTO | null> {
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
        } as Partial<IPatient>);
        return updated ? this._patientMapper.toDTO(updated) : null;
    }
}
