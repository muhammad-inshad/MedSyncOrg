import { HttpStatusCode } from "../../../../constants/enums.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { Types } from "mongoose";
export class PatientManagementService {
    constructor(_userRepo, _patientMapper, _appointmentRepo, _hospitalSubscriptionService) {
        this._userRepo = _userRepo;
        this._patientMapper = _patientMapper;
        this._appointmentRepo = _appointmentRepo;
        this._hospitalSubscriptionService = _hospitalSubscriptionService;
    }
    async addPatient(patientData, hospital_id, patientFile) {
        const patient = await this._userRepo.create({
            ...patientData,
            hospital_id: [new Types.ObjectId(hospital_id)],
            image: patientFile?.path || undefined,
            isActive: true
        });
        return this._patientMapper.toDTO(patient);
    }
    async patientsToggle(id) {
        const patient = await this._userRepo.findById(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        const updated = await this._userRepo.update(id, { isActive: !patient.isActive });
        return this._patientMapper.toDTO(updated);
    }
    async updatePatient(id, patientData, patientFile) {
        const updatePayload = { ...patientData };
        if (patientFile) {
            updatePayload.image = patientFile.path;
        }
        const updated = await this._userRepo.update(id, updatePayload);
        if (!updated) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        return this._patientMapper.toDTO(updated);
    }
    async getAllPatient(query) {
        const queryFilter = { hospital_id: query.hospital_id };
        if (query.filter === "active") {
            queryFilter.isActive = true;
        }
        else if (query.filter === "blocked") {
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
