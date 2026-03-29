export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface SavePrescriptionPayload {
  medicines: IMedicine[];
  notes: string;      
}

export interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  appointmentId: string | null;
  onSuccess?: () => void;
}



export interface IPrescription {
    _id: string;
    hospital_id: { _id: string; name: string; address?: string; };
    patient_email: string;
    doctor_id: { _id: string; name: string; specialization?: string; profileImage?: string; };
    appointment_id?: string;
    medicines: IMedicine[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
