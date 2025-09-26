import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import express from 'express';
import { CreateMessageDto } from "../dto/create-message.dto";
import { DeleteMessageDto } from "../dto/delete-message.dto";
import { UpdateMessageDto } from "../dto/update-message.dto";
import { IsAuthorMessage } from "../guard/isAuhtorMessage.guard";
import { MessageService } from "../service/message_service/message.service";
import { IsvalidRoomGuard } from "../guard/isValidInRoom.guard";
import { LoadingMessageDto } from "../dto/loading-message.dto";
import { FindingMessageDto } from "../dto/finding-message.dto";
@Controller('message')
export class MessageController {

	constructor(
		private readonly messageService: MessageService
	) { }
	// test message
	@Post('create-message')
	async createMessage(@Param('senderId') senderId: string, @Body() dto: CreateMessageDto) {
		return this.messageService.createMessage(senderId, dto)
	}

	@Patch('update-message')
	@UseGuards(IsAuthorMessage)
	async updateMessage(@Body() dto: UpdateMessageDto, @Query('messageId') messageId: string) {
		return this.messageService.updateMessage(dto, messageId)
	}

	@Delete('delete-message')
	@UseGuards(IsAuthorMessage)
	async deleteMessage(@Query('messageId') messageId: string, @Body() dto: DeleteMessageDto) {
		return this.messageService.deleteMessage(messageId, dto)
	}

	@Get('load-message')
	@UseGuards(IsvalidRoomGuard)
	async loadingMessage(@Req() req: express.Request, @Query('roomId') roomId: string, @Body() dto: LoadingMessageDto) {
		return this.messageService.loadingMessage(req, roomId, dto)
	}

	@Get('finding-message')
	@UseGuards(IsvalidRoomGuard)
	async findingMessage(@Req() req: express.Request, @Query('roomId') roomId: string, @Body() dto: FindingMessageDto) {
		return this.messageService.findingMessages(req, roomId, dto)
	}

	@Patch('mark-seen-message')
	async makeSeenMessage(@Req() req: express.Request, @Query('roomId') roomId: string, @Query('messageId') messageId: string) {
		return this.messageService.makeSeenMessage(req, roomId, messageId)
	}
}