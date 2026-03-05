export const setHospitalSession = (hospitalId: string) => {
  sessionStorage.setItem("hospitalId", hospitalId);
};

export const getHospitalSession = () => {
  return sessionStorage.getItem("hospitalId");
};

export const removeHospitalSession = () => {
  sessionStorage.removeItem("hospitalId");
};