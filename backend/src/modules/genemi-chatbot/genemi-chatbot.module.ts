import { Module } from '@nestjs/common';
import { GenemiController } from './genemi-chatbot.controller';
import { GenemiChatBotService } from './genemi-chatbot.service';
import { FaqService } from './service/faq.service';
import { TrackingService } from './service/tracking.service';

@Module({
	providers: [GenemiChatBotService, FaqService, TrackingService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
