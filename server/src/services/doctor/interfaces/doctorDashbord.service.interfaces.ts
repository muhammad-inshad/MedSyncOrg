import { SalaryHikeRequestinterface } from "../../../dto/doctor/doctor-response.dto.ts";
import { ISalaryRequest } from "../../../models/SalaryRequest.model.ts";


export interface IdoctorDashbord{
    salaryincreserequest(data:SalaryHikeRequestinterface):Promise<boolean>;
    getsalaryincreserequest(doctorId: string): Promise<ISalaryRequest | null>;
    getwallet(doctorId:string):Promise<{ balance: number, totalenrnings:number,totalwithdrawn:number,Transaction?: {
    amount: number;
    type: "credit" | "debit";
    date: string;
  }[]}>;

    withdraw(doctorId:string,amount:number):Promise<boolean>;
}