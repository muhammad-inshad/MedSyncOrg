import stripe from "../../config/stripe.js";

export const createCheckoutSession = async () => {

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "inr",
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