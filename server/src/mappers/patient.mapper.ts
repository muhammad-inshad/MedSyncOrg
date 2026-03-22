import { IMapper } from "../interfaces/mapper.interface.ts";
import { IPatient } from "../models/Patient.model.ts";
import { PatientResponseDTO, PatientResponseSchema } from "../dto/patient/patient-response.dto.ts";
export class PatientMapper implements IMapper<IPatient, PatientResponseDTO> {
    toDTO(patient: IPatient): PatientResponseDTO {
        // 1. Define the object FIRST
        const dto = {
            id: patient._id.toString(),
            name: patient.name || patient.email,
            email: patient.email,
            phone: patient.phone,
            isGoogleAuth: patient.isGoogleAuth || false,
            fatherName: patient.fatherName,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth,
            address: patient.address,
            isActive: patient.isActive,
            image: patient.image,
            bloodGroup: patient.bloodGroup,
            walletBalance: patient.walletBalance || 0,
            medicalReports: patient.medicalReports || [],
            hospital_id: patient.hospital_id?.toString(),
            appointmentHistory: patient.appointmentHistory
                ? patient.appointmentHistory.map(id => id.toString())
                : [],
            isProfileComplete: patient.isProfileComplete || false,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            age: patient.age
        };

        try {
            return PatientResponseSchema.parse(dto);
        } catch (error) {
            
            console.log("Validation failed for:", dto.email);
            console.error(JSON.stringify(error, null, 2)); 
            throw error;
        }
    }
}