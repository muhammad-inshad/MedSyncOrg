export interface IDoctorManagementService {
    updateHospital(id: string, updateData: any): Promise<any>;
    getAllDoctors(options: { page: number; limit: number; search?: string; filter?: object }): Promise<any>;
    toggleDoctorStatus(id: string): Promise<any>;
    acceptDoctor(id: string): Promise<any>;
    rejectDoctor(id: string, reason: string): Promise<any>;
    requestRevision(id: string, reason: string): Promise<any>;
    reapplyHospital(id: string): Promise<any>;
}
