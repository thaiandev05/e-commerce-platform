import { BadRequestException, Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiHeader } from "@nestjs/swagger";
import { StripeService } from "./stripe.service";
import express from "express";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { CreateOrderDto } from "./dto/create-checkout-session.dto";
import { Public } from "@/common/decorator/public.decorator";

@Public()
@ApiTags('Payment')
@Controller("payment")
export class StripeController {
	constructor
		(
			private readonly stripeService: StripeService,
			private readonly configService: ConfigService
		) {
	}

	@Post('checkout')
	@ApiOperation({
		summary: 'Create checkout session',
		description: 'Creates a Stripe checkout session for payment processing'
	})
	@ApiQuery({
		name: 'orderId',
		description: 'Order ID for the checkout session',
		required: true,
		type: String
	})
	@ApiBody({
		type: CreateOrderDto,
		description: 'Order items for checkout'
	})
	@ApiResponse({
		status: 200,
		description: 'Checkout session created successfully',
		schema: {
			type: 'object',
			properties: {
				url: {
					type: 'string',
					description: 'Stripe checkout URL'
				}
			}
		}
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - missing orderId or invalid items'
	})
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
	@ApiOperation({
		summary: 'Retrieve checkout session',
		description: 'Retrieves a Stripe checkout session by session ID'
	})
	@ApiQuery({
		name: 'sessionId',
		description: 'Stripe checkout session ID',
		required: true,
		type: String
	})
	@ApiResponse({
		status: 200,
		description: 'Checkout session retrieved successfully'
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - invalid session ID'
	})
	async getSession(@Query('sessionId') sessionId: string) {
		return this.stripeService.retrieveCheckoutSession(sessionId)
	}

	@Post('webhook')
	@ApiOperation({
		summary: 'Stripe webhook endpoint',
		description: 'Handles Stripe webhook events for payment processing'
	})
	@ApiHeader({
		name: 'stripe-signature',
		description: 'Stripe webhook signature for verification',
		required: true
	})
	@ApiResponse({
		status: 200,
		description: 'Webhook processed successfully',
		schema: {
			type: 'object',
			properties: {
				received: {
					type: 'boolean',
					example: true
				}
			}
		}
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid webhook signature'
	})
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