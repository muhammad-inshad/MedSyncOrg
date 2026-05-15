import { CheckoutResponseSchema } from "../dto/payment/checkout-response.dto.js";
export class PaymentMapper {
    toCheckoutDTO(url) {
        return CheckoutResponseSchema.parse({ url });
    }
}
