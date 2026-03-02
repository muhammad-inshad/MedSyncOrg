import { IMapper } from "../interfaces/mapper.interface.ts";
import { IPatient } from "../models/Patient.model.ts";
import { PatientResponseDTO } from "../dto/patient/patient-response.dto.ts";

export class PatientMapper implements IMapper<IPatient, PatientResponseDTO> {
    toDTO(patient: IPatient): PatientResponseDTO {
        return {
            id: patient._id.toString(),
            _id: patient._id.toString(),
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
        };
    }
}
