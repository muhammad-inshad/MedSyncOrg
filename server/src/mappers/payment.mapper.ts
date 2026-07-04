import { CheckoutResponseDTO, CheckoutResponseSchema } from "../dto/payment/checkout-response.dto.ts";

export class PaymentMapper {
    toCheckoutDTO(url: string | null): CheckoutResponseDTO {
        return CheckoutResponseSchema.parse({ url });
    }
}
