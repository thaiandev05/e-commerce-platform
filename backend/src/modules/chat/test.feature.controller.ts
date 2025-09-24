import { Body, Controller, Post, Req } from "@nestjs/common";
import { MessageService } from "./service/message.service";
import express from 'express'
import { CreateMessageDto } from "./dto/create-message.dto";
@Controller('test')
export class TestController {

	constructor(
		private readonly messageService: MessageService
	) { }
	// test message
	@Post('create-message')
	async createMessage(@Req() req: express.Request, @Body() dto: CreateMessageDto) {
		return this.messageService.createMessage(req, dto)
	}
}