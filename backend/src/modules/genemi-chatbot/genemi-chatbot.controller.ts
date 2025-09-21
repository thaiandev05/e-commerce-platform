import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { GetResponseDto } from "./get-ai-response.dto";
import { GenemiChatBotService } from "./genemi-chatbot.service";

@Controller('genemi')
export class GenemiController {
	constructor(
		private readonly service: GenemiChatBotService
	) { }

	@Post('sending-prompt')
	@UsePipes(new ValidationPipe({ transform: true }))
	getResponse(@Body() data: GetResponseDto) {
		return this.service.generateText(data)
	}
}