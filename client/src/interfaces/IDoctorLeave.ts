export interface IDoctorLeave {
  id: string;
  doctorId: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
    specialization: string;
    department: string;
  };
  startDate: string;
  endDate: string;
  leaveSession?: 'morning' | 'afternoon' | 'evening' | 'night';
  reason?: string;
  photo?: string;
  rejectedReson?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}
