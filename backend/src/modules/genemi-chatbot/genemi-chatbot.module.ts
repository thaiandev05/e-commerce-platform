import { Module } from '@nestjs/common';
import { GenemiController } from './genemi-chatbot.controller';
import { GenemiChatBotService } from './genemi-chatbot.service';
import { FaqService } from './service/faq.service';
import { TrackingService } from './service/tracking.service';
import { ProductModule } from '../product/product.module';
import { RecommentService } from './service/recomment.service';

@Module({
	imports: [ProductModule],
	providers: [GenemiChatBotService, FaqService, TrackingService, RecommentService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
