export const PATIENT_ROUTES = {
    LOGIN: "/login/:role",
    SIGNUP: "/patient/signup",
    OTP: '/otp',
    SELECTHOSPITAL: "/patient/selectHospital",
    PATIENTPROFILE: "/patient/profile",
    PATIENTEDIT: "/patient/patient-edit",
    HOSPITAL_HOMEPAGE: "/patient/hospital-home",
    HOSPITAL_DOCTOR: "/patient/hospital/doctors/:departmentId",
    HOSPITAL_DEPaRTMENTS: "/patient/hospital/deprtment",
    DOCTOR_PROFILE: `/patient/doctor-profile/:doctorId`,
    PATIENT_APPOIMENT: `/patient/appoiment/:doctorId`,
    VIEW_APPOIMENTS_HISTORY:`/patient/view-appoiments-history`,
    LIVETOKEN:"/patient/livetoken",
    PAYMENT_SUCCESS:"/patient/payment-success",
    PAYMENT_FAILED:"/patient/payment-failed",
    PRISCRIPTION:"/patient/priscriptions",
    WALLET: "/patient/wallet"
};
