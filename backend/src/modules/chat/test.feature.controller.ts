import { Body, Controller, Patch, Post, Req } from "@nestjs/common";
import { MessageService } from "./service/message.service";
import express from 'express'
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
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

	@Patch('update-message')
	async updateMessage(@Body() dto: UpdateMessageDto) {
		return this.messageService.updateMessage(dto)
	}
}