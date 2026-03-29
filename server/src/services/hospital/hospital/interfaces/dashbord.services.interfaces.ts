export interface IDashbord {
  getDashboardStats(): Promise<{
    totalDoctors: number;
    activeDoctors: number;
    totalPatients: number;
  }>;
}