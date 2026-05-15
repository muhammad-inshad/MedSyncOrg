import { Types } from "mongoose";
export class DoctorSalaryservice {
    constructor(_IsalaryRepository, _IDoctorRepository, _IHospitalDoctorConfigRepository) {
        this._IsalaryRepository = _IsalaryRepository;
        this._IDoctorRepository = _IDoctorRepository;
        this._IHospitalDoctorConfigRepository = _IHospitalDoctorConfigRepository;
    }
    async getDoctorSalaryRequests(hospital_id, page, limit, search, status) {
        const { salaryRequests, totalItems } = await this._IsalaryRepository.findDoctorSalaryRequests({
            hospital_id: hospital_id,
            page: page || 1,
            limit: limit || 5,
            search: search || "",
            status: status || "ALL",
        });
        const totalPages = Math.ceil(totalItems / (limit || 5));
        return {
            data: salaryRequests,
            total: totalItems,
            totalPages: totalPages
        };
    }
    async updateSalaryRequestStatus(id, hospital_id, status, data) {
        if (status === "APPROVED") {
            const doctorObjectId = new Types.ObjectId(data.doctorId);
            const hospitalObjectId = new Types.ObjectId(hospital_id);
            const existingConfig = await this._IHospitalDoctorConfigRepository.findOne({
                doctorId: doctorObjectId,
                hospitalId: hospitalObjectId,
            });
            if (existingConfig) {
                await this._IHospitalDoctorConfigRepository.update(existingConfig._id.toString(), {
                    hospitalCommission: data.hospitalCommission,
                    doctorFee: data.approvedAmount,
                });
            }
            else {
                await this._IHospitalDoctorConfigRepository.create({
                    doctorId: doctorObjectId,
                    hospitalId: hospitalObjectId,
                    hospitalCommission: data.hospitalCommission ?? 0,
                    doctorFee: data.approvedAmount ?? 0,
                });
            }
        }
        return await this._IsalaryRepository.updateSalaryRequestStatus(id, status, data);
    }
}
