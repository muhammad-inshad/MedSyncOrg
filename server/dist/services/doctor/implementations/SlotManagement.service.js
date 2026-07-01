import mongoose from "mongoose";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../constants/enums.js";
export class SlotMangementService {
    constructor(_slotrepo, _slotmapper, _appointementrepo) {
        this._slotrepo = _slotrepo;
        this._slotmapper = _slotmapper;
        this._appointementrepo = _appointementrepo;
    }
    async createSchedule(data) {
        if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
        }
        const existingSchedule = await this._slotrepo.findExistingSchedule(data.doctorId, data.daysOfWeek, data.session);
        if (existingSchedule) {
            const cheack = existingSchedule.includes(data.session);
            if (existingSchedule.length > 0 && cheack) {
                ApiResponse.throwError(HttpStatusCode.CONFLICT, `Schedule already created for the selected days and session on ${existingSchedule.join(",")}`);
            }
        }
        const [startH, startM] = data.startTime.split(":").map(Number);
        const [endH, endM] = data.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        const totalMinutes = endTotal - startTotal;
        if (totalMinutes <= 0) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid time range");
        }
        const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);
        const payload = {
            ...data,
            tokenPerDay,
            isActive: false,
            doctorId: new mongoose.Types.ObjectId(data.doctorId),
        };
        await this._slotrepo.create(payload);
    }
    async getSchedules(doctorId, page = 1, limit = 10) {
        const result = await this._slotrepo.findWithPagination({
            page,
            limit,
            filter: {
                doctorId: new mongoose.Types.ObjectId(doctorId),
            },
        });
        const mappedData = result.data.map((slot) => this._slotmapper.toDTO(slot));
        return {
            data: mappedData,
            total: result.total,
        };
    }
    async updateSchedule(scheduleId, data) {
        if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
        }
        const [startH, startM] = data.startTime.split(":").map(Number);
        const [endH, endM] = data.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        const totalMinutes = endTotal - startTotal;
        if (totalMinutes <= 0) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid time range");
        }
        const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);
        const payload = {
            ...data,
            doctorId: new mongoose.Types.ObjectId(data.doctorId),
            tokenPerDay,
        };
        const updated = await this._slotrepo.update(scheduleId, payload);
        if (!updated) {
            throw new Error("Update failed");
        }
    }
    async deleteSchedule(scheduleId, doctorId, status) {
        const isActive = !status;
        let patientBookedDate = await this._slotrepo.findById(scheduleId);
        console.log(patientBookedDate);
        if (patientBookedDate) {
            throw new Error("Cannot delete schedule with existing appointments");
        }
        const updated = await this._slotrepo.update(scheduleId, {
            isActive,
        });
        if (!updated) {
            throw new Error("Update failed");
        }
    }
}
