import { Request, Response } from "express";
import { createCheckoutSession } from "../../services/payment/payment.service.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";

import logger from "../../utils/logger.ts";

export const checkoutPayment = async (req: Request, res: Response) => {
  try {

    const session = await createCheckoutSession();

    res.status(200).json({
      success: true,
      url: session.url,
    });

  } catch (error) {
   ApiResponse.internalServerError(res, "Failed to create checkout session");
   logger.error("Payment checkout error:", error);
  }
};
