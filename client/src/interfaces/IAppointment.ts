

export interface IAppointment {
  _id: string;
  patientDetails: {
    name: string;
    age: number;
    phone: string;
    email?: string;
    address?: string;
  };
  tokenNumber: number;
  mode: string;
  bloodPressure?: string;
  heartRate?: string;
  weight?: string;
  status?:string
}

export interface IPrescriptionData {
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
  notes: string;
}