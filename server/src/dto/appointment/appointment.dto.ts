export interface BookAppointmentDTO {
    doctorId: string;
    hospitalId: string;
    appointmentDate: string; // ISO string
    visitTime: string; // "HH:mm"
    mode: "online" | "offline";
    patientDetails: {
        fullName: string;
        age: number;
        phone: string;
        email: string;
        address: string;
        bloodPressure?: string;
        heartRate?: string;
        weight?: string;
    };
}

export interface SlotStatusDTO {
    time: string;
    isAvailable: boolean;
}

export interface DailyTokenStatusDTO {
    date: string;
    bookedTokens: number;
    maxTokens: number;
    status: "Available" | "Filling Fast" | "Fully Booked";
}

export interface DoctorDailySlotsDTO {
    date: string;
    tokenInfo: DailyTokenStatusDTO;
}

export interface IPrescriptionData {
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
  notes: string;
}

export interface IAppointmentCheckoutData {
    doctorId: string;
    hospitalId: string;
    appointmentDate: string;
    mode: "online" | "offline";
    

    tokenNumber: number;
    slotStartTime: string; 
    slotEndTime: string;
    session?: "morning" | "afternoon" | "evening";

    patientDetails: {
        name: string;
        age: number;
        phone: string;
        email?: string;
        address?: string;
    };
    
    bloodPressure?: string;
    heartRate?: string;
    weight?: string;
    doctorName?: string;
    totalAmount?: number;
}