import { hospitalApi } from "@/constants/backend/hospital/hospital.api";

const handlePayment = async () => {
  try {

    const res = await hospitalApi.createPaymentSession();

    if (res.data.url) {
      window.location.href = res.data.url;
    }

  } catch (error) {
    console.log("Payment error", error);
  }
};