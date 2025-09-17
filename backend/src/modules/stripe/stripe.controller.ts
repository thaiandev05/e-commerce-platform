import { BadRequestException, Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import express from "express";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { CreateOrderDto } from "./dto/create-checkout-session.dto";
import { Public } from "@/common/decorator/public.decorator";
@Public()
@Controller("payment")
export class StripeController {
	constructor
		(
			private readonly stripeService: StripeService,
			private readonly configService: ConfigService
		) {
	}
	@Post('checkout')
	async checkout(@Body() createOrderDto: CreateOrderDto, @Query('orderId') orderId: string) {
		// Validation
		if (!orderId) {
			throw new BadRequestException('orderId is required');
		}

		if (!createOrderDto.items || !Array.isArray(createOrderDto.items) || createOrderDto.items.length === 0) {
			throw new BadRequestException('items array is required and must not be empty');
		}

		const session = await this.stripeService.createCheckOutSession(orderId, createOrderDto.items)
		return { url: session.url }
	}

	@Get('session')
	async getSession(@Query('sessionId') sessionId: string) {
		return this.stripeService.retrieveCheckoutSession(sessionId)
	}

	@Post('webhook')
	async webhook(@Req() req: express.Request) {
		const sig = req.headers['stripe-signature'] as string;
		const endpointSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

		let event: Stripe.Event;
		try {
			const stripe = (this.stripeService as any).stripe as Stripe;
			event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		} catch (err) {
			console.error('❌ Webhook signature verification failed:', err.message);
			throw new BadRequestException('Invalid signature');
		}

		// Xử lý các loại event
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session;
			console.log('✅ Payment success for order:', session.metadata?.orderId);
			// TODO: update order trong DB ở đây
		}

		return { received: true }
	}

}