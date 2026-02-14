import { UserRepository } from "../repositories/user.repository.ts";
import cloudinary from "../config/cloudinary.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";

export class PatientService {
    constructor(private readonly userRepo: UserRepository) { }

    async getProfile(userId: string) {
        const patient = await this.userRepo.findById(userId);

        if (!patient) {
            throw { status: 404, message: "Patient not found" };
        }

        const patientObj = patient.toObject ? patient.toObject() : patient;
        delete patientObj.password;

        return patientObj;
    }

    async getAllPatient(options: { page: number; limit: number; search?: string }) {
        const { page, limit, search } = options;
        return await this.userRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "phone"]
        });
    }

    async updatedPatient(id: string, updateData: any) {
        const existingPatient = await this.userRepo.findById(id);
        if (!existingPatient) {
            throw { status: 404, message: "Patient not found" };
        }
        if (updateData.image && updateData.image.startsWith('data:image')) {
            if (existingPatient.image) {
                const publicId = existingPatient.image.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`patient/profile/${publicId}`);
                }
            }
            const res = await cloudinary.uploader.upload(updateData.image, {
                folder: 'patient/profile'
            });
            updateData.image = res.secure_url;

        } else if (updateData.willRemoveImage === true) {
            if (existingPatient.image) {
                const publicId = existingPatient.image.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`patient/profile/${publicId}`);
                }
            }
            updateData.image = "";
        } else {
            delete updateData.image;
        }
        delete updateData.willRemoveImage;
        if (updateData.isActive !== undefined) {
            updateData.isActive = String(updateData.isActive) === 'true';
        }

        return await this.userRepo.update(id, updateData);
    }
}