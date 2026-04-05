import { IMapper } from "../interfaces/mapper.interface.ts";
import { IDoctorLeave } from "../models/doctorLeave.model.ts";
import { DoctorLeaveResponseDTO, DoctorLeaveResponseSchema } from "../dto/doctor/doctor-leave-response.dto.ts";

export class DoctorLeaveMapper implements IMapper<IDoctorLeave, DoctorLeaveResponseDTO> {
    toDTO(leave: IDoctorLeave): DoctorLeaveResponseDTO {
        const dto = {
            id: leave._id.toString(),
            doctorId: leave.doctorId && typeof leave.doctorId === 'object' && (leave.doctorId as any).name
                ? {
                    _id: ((leave.doctorId as any)._id || leave.doctorId).toString(),
                    name: (leave.doctorId as any).name,
                    email: (leave.doctorId as any).email,
                    profileImage: (leave.doctorId as any).profileImage,
                    specialization: (leave.doctorId as any).specialization,
                    department: (leave.doctorId as any).department,
                }
                : leave.doctorId.toString(),
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveSession: leave.leaveSession,
            reason: leave.reason,
            photo: leave.photo,
            rejectedReson: leave.rejectedReson,
            status: leave.status,
            createdAt: (leave as any).createdAt,
            updatedAt: (leave as any).updatedAt,
        };

        return DoctorLeaveResponseSchema.parse(dto);
    }
}
