export const PATIENTROUTES = {
  ROOT: "/",
  LOGIN: "/login/:role",
  SIGNUP:"/patient/signup",
  OTP:'/otp',
  SELECTHOSPITAL:"/patient/selectHospital",
  PATIENTPROFILE:"/patient/profile",
  DOCTORREGISTRACTIONFORM:"/patient/DoctorRegistrationForm"
};


export const COMMON={
  REVIEWPENDING:'/reviewpending',
  FORGETPASSWORD:'/forgot-password'
}

export const  ADMINROUTES={
  ADMINSIGNUP:"/admin/signup"
}

export const SUPERADMINROUTES={
  DASHBOARD:'/superadmin/dashboard',
  HOSPITALS: '/superadmin/hospitals',
  DOCTORS: '/superadmin/doctors',
  PATIENTS: '/superadmin/patients',
  DEPARTMENTS: '/superadmin/departments',
  SUBSCRIPTIONS: '/superadmin/subscriptions',
  KYC: '/superadmin/kyc',
  CHAT: '/superadmin/chat'
}