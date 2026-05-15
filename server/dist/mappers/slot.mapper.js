// mappers/slot.mapper.ts
import { SlotResponseSchema } from "../dto/doctor/slot-response.dto.js";
export class SlotMapper {
    toDTO(slot) {
        const dto = {
            id: slot._id.toString(),
            session: slot.session,
            daysOfWeek: slot.daysOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration,
            tokenPerDay: slot.tokenPerDay,
            isActive: slot.isActive,
        };
        return SlotResponseSchema.parse(dto);
    }
    toDTOList(slots) {
        return slots.map((slot) => this.toDTO(slot));
    }
}
