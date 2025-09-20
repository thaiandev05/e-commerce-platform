import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { GenemiService } from "./genemi-chatbot.service";
import { GetResponseDto } from "./get-ai-response.dto";

@Controller('genemi')
export class GenemiController {
	constructor(
		private readonly service: GenemiService
	) { }

	@Post('sending-prompt')
	@UsePipes(new ValidationPipe({ transform: true }))
	getResponse(@Body() data: GetResponseDto) {
		return this.service.generateText(data)
	}
}