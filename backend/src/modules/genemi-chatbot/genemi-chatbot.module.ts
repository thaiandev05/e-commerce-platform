import { Module } from '@nestjs/common';
import { GenemiController } from './genemi-chatbot.controller';
import { GenemiChatBotService } from './genemi-chatbot.service';
import { QuickReplyService } from './service/quick-reply.service';

@Module({
	providers: [GenemiChatBotService, QuickReplyService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
