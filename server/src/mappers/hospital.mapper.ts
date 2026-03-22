import { IMapper } from "../interfaces/mapper.interface.ts";
import { IHospital } from "../models/hospital.model.ts";
import { HospitalResponseDTO, HospitalResponseSchema } from "../dto/hospital/hospital-response.dto.ts";
import z from "zod";

export class HospitalMapper implements IMapper<IHospital, HospitalResponseDTO> {
    toDTO(
        hospital: IHospital, 
        limits?: HospitalResponseDTO['subscription']['limits'],
        currentCounts?: HospitalResponseDTO['currentCounts']
    ): HospitalResponseDTO {
        const dto = {
            id: hospital._id.toString(),
            hospitalName: hospital.hospitalName,
            logo: hospital.logo ?? undefined, // Convert null to undefined
            address: hospital.address,
            isActive: hospital.isActive,
            autoDisabled: hospital.autoDisabled,
            email: hospital.email,
            phone: hospital.phone,
            since: hospital.since,
            pincode: hospital.pincode,
            about: hospital.about ?? undefined,
            licence: hospital.licence ?? undefined,
            images: {
                landscape: hospital.images?.landscape || [],
                medicalTeam: hospital.images?.medicalTeam || [],
                patientCare: hospital.images?.patientCare || [],
                services: hospital.images?.services || [],
            },
            income: hospital.income || 0,
            reviewStatus: hospital.reviewStatus,
            // FIX: reapplyDate was null in your log. This converts it for Zod:
            reapplyDate: hospital.reapplyDate ?? undefined, 
            rejectionReason: hospital.rejectionReason ?? undefined,
            subscription: {
                plan: hospital.subscription?.plan ,
                amount: hospital.subscription?.amount || 0,
                status: hospital.subscription?.status || "active",
                startDate: hospital.subscription?.startDate ?? undefined,
                endDate: hospital.subscription?.endDate ?? undefined,
                limits: limits, // Ensure your Schema has .optional() for this
            },
            currentCounts: currentCounts,
            createdAt: hospital.createdAt,
            updatedAt: hospital.updatedAt,
        };

        try {
            return HospitalResponseSchema.parse(dto);
        } catch (error) {
            console.error("Hospital Mapping Failed for:", hospital.hospitalName);
            // This will tell you exactly which field is breaking the flow
            if (error instanceof z.ZodError) {
                console.error(error.format());
            }
            throw error; 
        }
    }
}