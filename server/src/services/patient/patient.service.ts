
import cloudinary from "../../config/cloudinary.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { IHospitalRepository } from "../../repositories/hospital/hospital.repository.interface.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { UpdatePatientDTO } from "../../dto/patient/patient-response.dto.ts";
import { IUserRepository } from "../../repositories/patient/user.repository.interface.ts";
import { IPatientService } from "./patient.service.interfaces.ts";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../constants/messages.ts";

export class PatientService implements IPatientService {
    constructor(
        private readonly userRepo: IUserRepository,
        private readonly hospitalRepo: IHospitalRepository
    ) { }

    async getProfile(userId: string) {
        const patient = await this.userRepo.findById(userId);

        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        const patientObj = patient.toObject ? patient.toObject() : patient;
        delete patientObj.password;

        return patientObj;
    }

    async getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }) {
        const { page, limit, search, filter } = options;
        return await this.userRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "qualification", "department"],
            filter
        });
    }

    async updateProfile(id: string, updateData: UpdatePatientDTO) {
        const existingPatient = await this.userRepo.findById(id);
        if (!existingPatient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
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


 async gethospitals(page: number, limit: number, search: string) {
    
    const result = await this.hospitalRepo.findWithPagination({
        page,
        limit,
        search,
        searchFields: ['hospitalName', 'address'], 
        filter: { isActive: true } 
    });

    const cleanedHospitals = result.data.map(hospital => {
        const hospitalObj = hospital.toObject ? hospital.toObject() : hospital;
        delete hospitalObj.password;
        return hospitalObj;
    });

    return {
        hospitals: cleanedHospitals,
        totalCount: result.total,
        totalPages: Math.ceil(result.total / limit),
        currentPage: page
    };
}
    async changePassword(id: string, currentPassword: string, newPassword: string) {
        const patient = await this.userRepo.findByIdWithPassword(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, patient.password);
        if (!isMatch) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Current password does not match");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await this.userRepo.update(id, { password: hashedNewPassword });
    }

    async selectedHospital(id:string){
        const Hospital=await this.hospitalRepo.findById(id)
        if(!Hospital){
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST,MESSAGES.ADMIN.NOT_FOUND)
        }
         const hospitalObj = Hospital.toObject ? Hospital.toObject() : Hospital
       
    return {
        ...hospitalObj,
        _id: hospitalObj._id.toString()
    }
    }
}
