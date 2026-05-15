import { IPatient } from "../../../../models/Patient.model.js";
import { IPatientManagementService } from "../interfaces/patient.management.service.interface.js";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.js";
import { PatientMapper } from "../../../../mappers/patient.mapper.js";
import { IAppointmentRepository } from "../../../../repositories/appointment/appointment.repository.interface.js";
import { PatientResponseDTO, CreatePatientDTO, UpdatePatientDTO } from "../../../../dto/patient/patient-response.dto.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { IHospitalSubscriptionService } from "../../subscription/interfaces/subscription.service.interface.js";
import { Types } from "mongoose";
import { IPatientFilter } from "../../../../types/hospital.types.js";

export class PatientManagementService implements IPatientManagementService {
    constructor(
        private readonly _userRepo: IUserRepository,
        private readonly _patientMapper: PatientMapper,
        private readonly _appointmentRepo: IAppointmentRepository,
        private readonly _hospitalSubscriptionService: IHospitalSubscriptionService
    ) {}

    async addPatient(patientData: CreatePatientDTO, hospital_id: string, patientFile?: Express.Multer.File): Promise<PatientResponseDTO> {
        const patient = await this._userRepo.create({
            ...patientData,
            hospital_id: [new Types.ObjectId(hospital_id)],
            image: patientFile?.path || undefined,
            isActive: true
        } as Partial<IPatient>);
        return this._patientMapper.toDTO(patient);
    }

    async patientsToggle(id: string): Promise<PatientResponseDTO> {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        const updated = await this._userRepo.update(id, { isActive: !patient!.isActive });
        return this._patientMapper.toDTO(updated!);
    }

    async updatePatient(id: string, patientData: UpdatePatientDTO, patientFile?: Express.Multer.File): Promise<PatientResponseDTO> {
        const updatePayload: Partial<IPatient> = { ...patientData } as Partial<IPatient>;
        if (patientFile) {
            updatePayload.image = patientFile.path;
        }
        const updated = await this._userRepo.update(id, updatePayload);
        if (!updated) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        return this._patientMapper.toDTO(updated!);
    }

    async getAllPatient(query: { page: number; limit: number; search: string; filter?: "all" | "active" | "blocked"; hospital_id: string }): Promise<{ data: PatientResponseDTO[]; total: number }> {
        const queryFilter: IPatientFilter = { hospital_id: query.hospital_id };
        if (query.filter === "active") {
            queryFilter.isActive = true;
        } else if (query.filter === "blocked") {
            queryFilter.isActive = false;
        }
        const result = await this._userRepo.findWithPagination({
            page: query.page,
            limit: query.limit,
            search: query.search,
            searchFields: ["name", "email", "phone"],
            filter: queryFilter
        });
        return {
            data: result.data.map(p => this._patientMapper.toDTO(p)),
            total: result.total
        };
    }
}
