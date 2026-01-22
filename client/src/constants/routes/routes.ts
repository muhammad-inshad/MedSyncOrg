
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
  FORGETPASSWORD:'/forgot-password',
  RESETPASSWORD:'/reset-password'
}

export const  ADMINROUTES={
  ADMINSIGNUP:"/admin/signup",
  ADMINDASHBOARD:"/admin/dashboard"
}

export const DOCTORS={
  DOCTORDASHBOARD:"/doctor/dashboard"
}

export const SUPERADMINROUTES={
  DASHBOARD:'/superadmin/dashboard',
  HOSPITALS: '/superadmin/hospitals',
  EDITHOSPITAL:"/superadmin/edit-hospital",
  SUBSCRIPTIONS: '/superadmin/subscriptions',
  KYC: '/superadmin/kyc',
  CHAT: '/superadmin/chat'
}
