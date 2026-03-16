import { Request, Response } from "express";
import { createCheckoutSession } from "../../services/payment/payment.service.ts";

export const checkoutPayment = async (req: Request, res: Response) => {
  try {

    const session = await createCheckoutSession();

    res.status(200).json({
      success: true,
      url: session.url,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Payment failed",
    });

  }
};