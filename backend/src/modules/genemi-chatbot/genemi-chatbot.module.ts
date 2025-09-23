import { Module } from '@nestjs/common';
import { GenemiController } from './genemi-chatbot.controller';
import { GenemiChatBotService } from './genemi-chatbot.service';
import { FaqService } from './service/faq.service';

@Module({
	providers: [GenemiChatBotService, FaqService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
