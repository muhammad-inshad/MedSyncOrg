// mappers/slot.mapper.ts

import { IMapper } from "../interfaces/mapper.interface.ts";
import { SlotResponseDTO, SlotResponseSchema } from "../dto/doctor/slot-response.dto.ts";
import { IDoctorSchedule } from "../models/DoctorSlot.ts";

export class SlotMapper implements IMapper<IDoctorSchedule, SlotResponseDTO> {
  toDTO(slot: IDoctorSchedule): SlotResponseDTO {
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
   toDTOList(slots: IDoctorSchedule[]): SlotResponseDTO[] {
    return slots.map((slot) => this.toDTO(slot));
  }
}