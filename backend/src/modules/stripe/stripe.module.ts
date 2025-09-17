import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StripeService } from "./stripe.service";
import Stripe from 'stripe';
import { StripeController } from "./stripe.controller";
@Module({
	imports: [ConfigModule],
	providers: [
		StripeService,
		{
			provide: 'STRIPE_CLIENT',
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return new Stripe(configService.getOrThrow<string>("SECRET_KEY_STRIPE"), {
					apiVersion: '2025-08-27.basil'
				})
			}
		}
	],
	controllers: [StripeController],
})
export class StripeModule {}