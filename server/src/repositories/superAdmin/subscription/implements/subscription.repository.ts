import { BaseRepository } from "../../../IBase/BaseRepository.ts";
import { FilterQuery } from "mongoose";
import { ISubscription } from "../../../../models/subscription.ts";
import { ISubscriptionRepository } from "../interfaces/subscription.repository.interface.ts";
import { SubscriptionModel } from "../../../../models/subscription.ts";
import { HospitalModel, IHospital } from "../../../../models/hospital.model.ts";
import { IsubscriptionFilter } from "../../../../types/hospital.types.ts";

export class SubscriptionRepository
  extends BaseRepository<ISubscription>
  implements ISubscriptionRepository {

  constructor() {
    super(SubscriptionModel);
  }

  private buildQuery(
    search: string,
    status: string
  ): FilterQuery<ISubscription> {

    const query: FilterQuery<ISubscription> = {};

    if (search && search.trim() !== "") {
      query.$or = [
        { planName: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "All") {
      const normalizedStatus = status.toLowerCase();

      if (normalizedStatus === "active") {
        query.status = "active";
      } 
      else if (normalizedStatus === "inactive") {
        query.status = { $in: ["expired", "cancelled"] };
      } 
      else if (
        normalizedStatus === "expired" ||
        normalizedStatus === "cancelled"
      ) {
        query.status = normalizedStatus as "expired" | "cancelled";
      }
    }

    return query;
  }

  async findAllWithPagination(
    skip: number,
    limit: number,
    search: string,
    status: string
  ): Promise<ISubscription[]> {

    const query = this.buildQuery(search, status);


    return await SubscriptionModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async count(search: string, status: string): Promise<number> {
    const query = this.buildQuery(search, status);
    return await SubscriptionModel.countDocuments(query).exec();
  }

  async updateById(
    id: string,
    updateData: Partial<ISubscription>
  ): Promise<ISubscription | null> {

    return await SubscriptionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
  }

  async findByPlanName(planName: string): Promise<ISubscription | null> {

    return await SubscriptionModel.findOne({
      planName: { $regex: new RegExp(`^${planName}$`, "i") },
      status: "active",
    }).exec();
  }

  async updateExpiredSubscription():Promise<void>{
    const now =new Date();
    await HospitalModel.updateMany(
      {
        "subscription.endDate":{$lt:now},
        "subscription.status":"active"
      },{
        $set:{"subscription.status":"expired"}
      }
    )
  }

async findHospitalWithSubscrib(
  skip: number,
  limit: number,
  search: string,
  filter: IsubscriptionFilter
): Promise<IHospital[]> {

  await this.updateExpiredSubscription();

  const query: FilterQuery<IHospital> = { ...filter,reviewStatus: "approved"}; 
  
  if (search && search.trim() !== "") {
    query.hospitalName = { $regex: search, $options: "i" };
  }

  return HospitalModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
}
}