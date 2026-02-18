import { IAdmin } from "../models/admin.model.ts";

export interface IAdminService {
    getAdminProfile(adminID: string): Promise<any>;
    getAllHospitals(): Promise<any[]>;
}
