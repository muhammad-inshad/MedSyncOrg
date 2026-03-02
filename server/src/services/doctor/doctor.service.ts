
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import cloudinary from "../../config/cloudinary.ts";
import { extractPublicId } from "../../utils/cloudinaryUpload.ts";
import { ITokenService } from "../token/token.service.interface.ts";
import { HttpStatusCode } from "../../constants/httpStatus.ts";
import { MESSAGES } from "../../constants/messages.ts";
import { UpdateDoctorDTO } from "../../dto/doctor/doctor-response.dto.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { IDoctorRepository } from "../../repositories/doctor/doctor.repository.interface.ts";

export class DoctorService {
<<<<<<< HEAD
    private readonly _doctorRepo: IDoctorRepository;;
    private readonly _tokenService: TokenService;

    constructor(doctorRepo: IDoctorRepository, tokenService: TokenService) {
        this._doctorRepo = doctorRepo;
        this._tokenService = tokenService;
=======
   
    constructor(    private readonly _doctorRepo: IDoctorRepository, private readonly _tokenService: ITokenService) {
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)
    }


    async getDoctorProfile(doctorId: string) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }
        return {
            ...doctor.toObject(),
            role: "doctor"
        };
    }

    async updateDoctorProfile(id: string, updateData: UpdateDoctorDTO) {
        const existingDoctor = await this._doctorRepo.findById(id);
        if (!existingDoctor) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);

        if (updateData.profileImageFile) {
            if (existingDoctor.profileImage) {
                await cloudinary.uploader.destroy(extractPublicId(existingDoctor.profileImage));
            }
            const profileImageUrl = await uploadBufferToCloudinary(
                updateData.profileImageFile.buffer,
                "doctors/profile"
            );
            updateData.profileImage = profileImageUrl;
            delete updateData.profileImageFile;
        } else if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {

            const res = await cloudinary.uploader.upload(updateData.profileImage, {
                folder: 'doctors/profiles'
            });
            updateData.profileImage = res.secure_url;
        }

        if (updateData.licenseFile) {
            if (existingDoctor.licence) {
                // await cloudinary.uploader.destroy(extractPublicId(existingDoctor.licence));
            }
            const licenseUrl = await uploadBufferToCloudinary(
                updateData.licenseFile.buffer,
                "doctors/license"
            );
            updateData.licence = licenseUrl;
            delete updateData.licenseFile;
        } else if (updateData.licenseImage && updateData.licenseImage.startsWith('data:image')) {
            const res = await cloudinary.uploader.upload(updateData.licenseImage, {
                folder: 'doctors/licenses'
            });
            updateData.licence = res.secure_url;
            delete updateData.licenseImage;
        }
        updateData.rejectionReason = undefined;

        return await this._doctorRepo.update(id, updateData as UpdateDoctorDTO as Partial<IDoctor>);
    }

    async reapply(doctorId: string) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);

        const updateData = {
            ...doctor.toObject(),
            reviewStatus: "pending",
            reapplyDate: new Date(),
        };

        return await this._doctorRepo.update(doctorId, updateData);
    }
}
