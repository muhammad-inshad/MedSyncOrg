import { AppointmentResponseDTO } from "../../../../dto/appointment/appointment-response.dto.ts";
import { IAppointment } from "../../../../models/appointment.ts";

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

    getWallet(hospitalId:string):Promise<{
      balance: number;
      totalenrnings: number;
      totalwithdrawn: number;
      transactions: { amount: number; type: 'credit' | 'debit'; date: Date; description: string }[];
    }>;
    withdraw(hospitalId:string, amount:number):Promise<{
      success: boolean;
      message: string;
    }>;

    getReqcancalation(hospitalId:string):Promise<AppointmentResponseDTO[]>,

    approvecancellation(id:string,hospitalId:string):Promise<boolean>,

    rejectcancellation(id:string,reason:string):Promise<boolean>

}
