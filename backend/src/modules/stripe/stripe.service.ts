import { Inject, Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
	constructor(@Inject("STRIPE_CLIENT") private readonly stripe: Stripe) { }

	async createCheckOutSession(
		orderId: string,
		createCheckoutSessionDto: { name: string, amount: number, quantity: number }[],
	) {
		// Validate input
		if (!createCheckoutSessionDto || !Array.isArray(createCheckoutSessionDto) || createCheckoutSessionDto.length === 0) {
			throw new Error('Items array is required and must not be empty');
		}

		return await this.stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: createCheckoutSessionDto.map((item) => ({
				price_data: {
					currency: 'usd',
					product_data: { name: item.name },
					unit_amount: item.amount
				},
				quantity: item.quantity,
			})),
			metadata: { orderId },
			success_url: 'http://localhost:4000/payments/success?session_id={CHECKOUT_SESSION_ID}',
			cancel_url: 'http://localhost:4000/payments/cancel',
		} satisfies Stripe.Checkout.SessionCreateParams);
	}


	async retrieveCheckoutSession(sessionId: string) {
		return await this.stripe.checkout.sessions.retrieve(sessionId);
	}
}