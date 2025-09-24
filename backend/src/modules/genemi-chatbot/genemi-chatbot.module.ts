import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { GenemiController } from './genemi-chatbot.controller';
import { GenemiChatBotService } from './genemi-chatbot.service';
import { FaqService } from './service/faq.service';
import { RecommentService } from './service/recomment.service';
import { TrackingService } from './service/tracking.service';
import { CartModule } from '../cart/cart.module';
import { CheckoutAndCart } from './service/checkoutAndCart.service';
import { AfterSaleService } from './service/after-sale.service';

@Module({
	imports: [ProductModule, CartModule],
	providers: [GenemiChatBotService, FaqService, TrackingService, RecommentService, CheckoutAndCart, AfterSaleService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
