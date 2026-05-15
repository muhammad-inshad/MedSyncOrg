import { Types } from "mongoose";
import { DoctorLeaveResponseSchema } from "../dto/doctor/doctor-leave-response.dto.js";
export class DoctorLeaveMapper {
    toDTO(leave) {
        const dto = {
            id: leave._id.toString(),
            doctorId: leave.doctorId instanceof Types.ObjectId
                ? leave.doctorId.toString()
                : {
                    _id: leave.doctorId._id.toString(),
                    name: leave.doctorId.name,
                    email: leave.doctorId.email,
                    profileImage: leave.doctorId.profileImage,
                    specialization: leave.doctorId.specialization,
                    department: leave.doctorId.department,
                },
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveSession: leave.leaveSession,
            reason: leave.reason,
            photo: leave.photo,
            rejectedReson: leave.rejectedReson,
            status: leave.status,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt,
        };
        return DoctorLeaveResponseSchema.parse(dto);
    }
}
