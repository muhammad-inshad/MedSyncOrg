import stripe from "../../config/stripe.ts";

export const createCheckoutSession = async () => {

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Hospital Subscription",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],

    success_url: "http://localhost:5173/payment-success",
    cancel_url: "http://localhost:5173/payment-cancel",
  });

  return session;
};