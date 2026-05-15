import { BaseRepository } from "../IBase/BaseRepository.js";
import { IPrescription } from "../../models/prescription.model.js";
import { Model, FilterQuery } from "mongoose";
import { DoctorModel } from "../../models/doctor.model.js";
import { HospitalModel } from "../../models/hospital.model.js";

export class PrescriptionRepository extends BaseRepository<IPrescription> {
  constructor(model: Model<IPrescription>) {
    super(model);
  }

  async findPrescriptionsPaginated(options: {
    email: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    const { email, page, limit, search } = options;
    let filter: FilterQuery<IPrescription> = { patient_email: email };

    if (search) {
      const [doctorIds, hospitalIds] = await Promise.all([
        DoctorModel.find({ name: { $regex: search, $options: "i" } }).distinct(
          "_id",
        ),
        HospitalModel.find({
          hospitalName: { $regex: search, $options: "i" },
        }).distinct("_id"),
      ]);

      filter = {
        ...filter,
        $or: [
          { doctor_id: { $in: doctorIds } },
          { hospital_id: { $in: hospitalIds } },
        ],
      };
    }

    const total = await this.model.countDocuments(filter);
    const data = await this.model
      .find(filter)
      .populate("doctor_id")
      .populate("hospital_id")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
