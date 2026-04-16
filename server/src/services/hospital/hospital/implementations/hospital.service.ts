import { MESSAGES } from "../../../../constants/messages.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { HospitalResponseDTO, UpdateHospitalDTO, selectedHospitalDto, SelectedHospitalSchema } from "../../../../dto/hospital/hospital-response.dto.ts";
import { IHospitalService } from "../interfaces/hospital.services.interfaces.ts";
import { IPatientService } from "../../../../services/patient/interfaces/patient.service.interfaces.ts"
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HospitalMapper } from "../../../../mappers/hospital.mapper.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import Logger from "../../../../utils/logger.ts";
import bcrypt from "bcryptjs";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";

import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";

export class HospitalService implements IHospitalService {
    constructor(
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _hospitalMapper: HospitalMapper,
        private readonly _imageService: ICloudinaryImageService,
        private readonly _patientService: IPatientService,
        private readonly _doctorRepo: IDoctorRepository,
        private readonly _departmentRepo: IDepartmentRepository,
        private readonly _userRepo: IUserRepository,
        private readonly _subscriptionRepo: ISubscriptionRepository
    ) { }

    async getHospitalProfile(hospitalId: string): Promise<HospitalResponseDTO> {
        const hospital = await this._hospitalRepo.findById(hospitalId);

        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.ADMIN.NOT_FOUND);
        }

        const [doctors, patients, departments] = await Promise.all([
            this._doctorRepo.countDocuments({ hospital_id: hospitalId }),
            this._userRepo.countDocuments({ hospital_id: hospitalId }),
            this._departmentRepo.countDocuments({ hospital_id: hospitalId })
        ]);

        const currentCounts = { doctors, patients, departments };

        let limits: HospitalResponseDTO['subscription']['limits'] | undefined;
        if (hospital!.subscription?.plan) {
            const planName = hospital!.subscription.plan.charAt(0).toUpperCase() + hospital!.subscription.plan.slice(1);
            const planDetails = await this._subscriptionRepo.findByPlanName(planName);
            console.log(planDetails)
        }
      
        return this._hospitalMapper.toDTO(hospital!, limits, currentCounts);
    }

    async getSelectedHospital(hospitalId: string, page: number = 1, limit: number = 10, search: string = ""): Promise<selectedHospitalDto> {
        const data = await this._patientService.selectedHospital(hospitalId, page, limit, search);
        return SelectedHospitalSchema.parse(data);
    }

    async updateHospitalStatusReapply(hospitalId: string): Promise<HospitalResponseDTO | null> {
        const updatedHospital = await this._hospitalRepo.update(hospitalId, {
            reviewStatus: "pending",
            rejectionReason: undefined
        } as Partial<IHospital>);
        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }

    async updateHospital(
  hospitalId: string,
  hospitalData: UpdateHospitalDTO,
  files?: { [fieldname: string]: Express.Multer.File[] }
): Promise<HospitalResponseDTO | null> {

  const hospital = await this._hospitalRepo.findById(hospitalId);

  if (!hospital) {
    Logger.warn(`Update Hospital failed: Hospital not found with ID ${hospitalId}`);
    return null;
  }

  const updatePayload: UpdateHospitalDTO = { ...hospitalData };
  if (updatePayload.password && updatePayload.password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
  } else {
    delete updatePayload.password;
  }

  try {
    if (typeof updatePayload.subscription === "string") {
      updatePayload.subscription = JSON.parse(updatePayload.subscription);
    }

    if (typeof updatePayload.images === "string") {
      updatePayload.images = JSON.parse(updatePayload.images);
    }

    if (typeof updatePayload.since === "string") {
      updatePayload.since = parseInt(updatePayload.since, 10);
    }

  } catch (error) {
    Logger.error("Error parsing JSON fields in hospital update", error);
  }

  const currentImages = hospital.images || {
    landscape: [],
    medicalTeam: [],
    patientCare: [],
    services: [],
  };

  const desiredImages =
    (updatePayload.images as IHospital["images"]) || currentImages;

  if (typeof updatePayload.logo === "string" && updatePayload.logo.startsWith("data:image")) {
    if (hospital.logo) await this._imageService.deleteImage(hospital.logo);

    updatePayload.logo = await this._imageService.uploadImage(
      updatePayload.logo,
      "hospitals/logos"
    );

  } else if (updatePayload.logo === "" && hospital.logo) {

    await this._imageService.deleteImage(hospital.logo);
    updatePayload.logo = "";

  } else if (files?.logo?.[0]) {

    if (hospital.logo) await this._imageService.deleteImage(hospital.logo);

    updatePayload.logo = await this._imageService.uploadImage(
      files.logo[0].buffer,
      "hospitals/logos"
    );
  }

  if (typeof updatePayload.licence === "string" && updatePayload.licence.startsWith("data:image")) {
    if (hospital.licence) await this._imageService.deleteImage(hospital.licence);

    updatePayload.licence = await this._imageService.uploadImage(
      updatePayload.licence,
      "hospitals/licenses"
    );

  } else if (updatePayload.licence === "" && hospital.licence) {

    await this._imageService.deleteImage(hospital.licence);
    updatePayload.licence = "";

  } else if (files?.licence?.[0]) {

    if (hospital.licence) await this._imageService.deleteImage(hospital.licence);

    updatePayload.licence = await this._imageService.uploadImage(
      files.licence[0].buffer,
      "hospitals/licenses"
    );
  }
  const categories = ["landscape", "medicalTeam", "patientCare", "services"] as const;

  updatePayload.images = { ...currentImages };

  for (const category of categories) {

    const currentUrls = currentImages[category] || [];
    const desiredState = desiredImages[category] || [];

    let finalState = [...desiredState];

    if (files?.[category]) {
      const uploadedUrls = await Promise.all(
        files[category].map(file =>
          this._imageService.uploadImage(
            file.buffer,
            `hospitals/gallery/${category}`
          )
        )
      );

      finalState = [...finalState, ...uploadedUrls];
    }

    updatePayload.images[category] =
      await this._imageService.processGalleryUpdate(
        currentUrls,
        finalState,
        `hospitals/gallery/${category}`
      );
  }

  if (
    updatePayload.subscription &&
    typeof updatePayload.subscription !== "string"
  ) {
    const subscription = updatePayload.subscription;

    if (subscription.plan) {
      const planDetails =
        await this._subscriptionRepo.findByPlanName(subscription.plan);

      if (planDetails) {
        const startDate = subscription.startDate
          ? new Date(subscription.startDate)
          : new Date();

        subscription.startDate = startDate;

        subscription.endDate = this.calculateSubscriptionEndDate(
          startDate,
          planDetails.duration || 1,
          planDetails.durationUnit || "months"
        );
      }
    }
  }


  Logger.info(`Updating hospital profile for ID: ${hospitalId}`);

  const updatedHospital = await this._hospitalRepo.update(
    hospitalId,
    updatePayload as Partial<IHospital>
  );

  return updatedHospital
    ? this._hospitalMapper.toDTO(updatedHospital)
    : null;
}

    private calculateSubscriptionEndDate(startDate: Date, duration: number, unit: string): Date {
        const endDate = new Date(startDate);
        switch (unit) {
            case 'days':
                endDate.setDate(endDate.getDate() + duration);
                break;
            case 'months':
                endDate.setMonth(endDate.getMonth() + duration);
                break;
            case 'years':
                endDate.setFullYear(endDate.getFullYear() + duration);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + duration);
        }
        return endDate;
    }
}
