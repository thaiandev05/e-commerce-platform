import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe, HttpException, HttpStatus, UseInterceptors } from "@nestjs/common";
import { GetResponseDto } from "./dto/get-ai-response.dto";
import { GenemiChatBotService } from "./genemi-chatbot.service";
import { Public } from "@/common/decorator/public.decorator";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ResponseInterceptor } from "./response.interceptor";

@UseInterceptors(ResponseInterceptor)
@ApiTags('Gemini ChatBot')
@Controller('genemi')
export class GenemiController {
	constructor(
		private readonly service: GenemiChatBotService
	) { }

	@Public()
	@Post('sending-prompt')
	@UsePipes(new ValidationPipe({ transform: true }))
	@ApiOperation({ summary: 'Send prompt to Gemini AI' })
	@ApiResponse({ status: 200, description: 'AI response generated successfully' })
	@ApiResponse({ status: 400, description: 'Invalid input data' })
	async getResponse(@Body() data: GetResponseDto) {
		try {
			const result = await this.service.generateText(data)
			return result
		} catch (error) {
			throw new HttpException(
				{ message: error.message || 'Internal server error', success: false },
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}

	@Public()
	@Get('welcome')
	@ApiOperation({ summary: 'Get welcome message' })
	@ApiResponse({ status: 200, description: 'Welcome message retrieved' })
	async getWelcomeMessage(@Query('userId') userId?: string) {
		try {
			const message = await this.service.getWelcomeMessage(userId)
			return {
				success: true,
				message,
				timestamp: new Date().toISOString()
			}
		} catch (error) {
			throw new HttpException(
				{ message: 'Failed to get welcome message', success: false },
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		}
	}
}