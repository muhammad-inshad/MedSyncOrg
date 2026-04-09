export interface IDashbord {
  getDashboardStats(hospitalId:string): Promise<{
    totalDoctors: number;
    activeDoctors: number;
    totalPatients: number;
  }>;

  getDoctorStatus(hospitalId: string): Promise<{
    total: number;
    active: number;
    blocked: number;
    pending: number;}>;

    getKycStats(hospitalId: string): Promise<{
      total: number;
      pending: number;
      rejected: number;
      revision: number;
    }>;

    getCommonStats(hospitalId: string, type: string): Promise<{
      total: number;
      active: number;
      blocked: number;
    }>;
}
