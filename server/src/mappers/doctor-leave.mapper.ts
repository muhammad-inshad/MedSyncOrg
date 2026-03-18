import { IMapper } from "../interfaces/mapper.interface.ts";
import { IDoctorLeave } from "../models/doctorLeave.model.ts";
import { DoctorLeaveResponseDTO, DoctorLeaveResponseSchema } from "../dto/doctor/doctor-leave-response.dto.ts";

export class DoctorLeaveMapper implements IMapper<IDoctorLeave, DoctorLeaveResponseDTO> {
    toDTO(leave: IDoctorLeave): DoctorLeaveResponseDTO {
        const dto = {
            id: leave._id.toString(),
            doctorId: leave.doctorId.toString(),
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
