import { Module } from '@nestjs/common';
import { GenemiService } from './genemi-chatbot.service';
import { GenemiController } from './genemi-chatbot.controller';

@Module({
	providers: [GenemiService],
	controllers: [GenemiController]
})
export class GenemiChatbotModule {}
