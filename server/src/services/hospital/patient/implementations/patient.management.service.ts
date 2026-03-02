import { Types } from "mongoose";
import { IPatientManagementService } from "../interfaces/patient.management.service.interface.ts";
import { IPatient } from "../../../../models/Patient.model.ts";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { PatientMapper } from "../../../../mappers/patient.mapper.ts";
import { IPaginationResult } from "../../../../types/hospital.types.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";

export class PatientManagementService implements IPatientManagementService {
    constructor(
        private readonly _userRepo: IUserRepository,
        private readonly _patientMapper: PatientMapper
    ) { }

    async addPatient(data: Partial<IPatient>, hospital_id: string, file?: Express.Multer.File): Promise<PatientResponseDTO> {
        const existingPatient = await this._userRepo.findByEmail(data.email!);
        if (existingPatient) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, "Patient already exists with this email");
        }

        let imageUrl = "";
        if (file) {
            imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
        }

        const patientData = {
            ...data,
            hospital_id: new Types.ObjectId(hospital_id),
            image: imageUrl,
            isActive: true,
            isProfileComplete: true,
        };

        const created = await this._userRepo.create(patientData);
        return this._patientMapper.toDTO(created);
    }

    async patientsToggle(id: string): Promise<PatientResponseDTO | null> {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        const newStatus = !patient.isActive;
        const updated = await this._userRepo.update(id, { isActive: newStatus } as Partial<IPatient>);
        return updated ? this._patientMapper.toDTO(updated) : null;
    }

    async updatePatient(id: string, data: Partial<IPatient>, file?: Express.Multer.File): Promise<PatientResponseDTO | null> {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        let imageUrl = patient.image || "";
        if (file) {
            imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
        }

        const updated = await this._userRepo.update(id, {
            ...data,
            image: imageUrl,
        } as Partial<IPatient>);
        return updated ? this._patientMapper.toDTO(updated) : null;
    }

    async getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }): Promise<IPaginationResult<PatientResponseDTO>> {
        const { page, limit, search } = options;
        const result = await this._userRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email"],
        });
        console.log(result)
        return {
            data: result.data.map(p => this._patientMapper.toDTO(p)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}
