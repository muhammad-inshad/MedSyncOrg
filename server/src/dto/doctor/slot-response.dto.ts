import { z } from "zod";

export const SlotResponseSchema = z.object({
  id: z.string(),
  session: z.enum(["morning", "afternoon", "evening"]),
  daysOfWeek: z.array(z.number()),
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number(),
  tokenPerDay: z.number(),
  isActive: z.boolean(),
});

export type SlotResponseDTO = z.infer<typeof SlotResponseSchema>;