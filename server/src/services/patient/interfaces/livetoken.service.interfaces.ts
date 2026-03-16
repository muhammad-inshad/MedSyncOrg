export interface ILiveTokenResponse {
    currentLiveToken: number;
    patientTokenNumber: number;
    doctorName: string;
    appointmentId: string;
}

export interface Igettoken {
    getPatientLiveToken(patientId: string, doctorId?: string): Promise<ILiveTokenResponse | null>;
}
