import { Body, Controller, Post, Req } from "@nestjs/common";
import express from 'express'
import { RoomService } from "../service/messgae_service/room.service";
import { CreateRoomDto } from "../dto/create-room.dto";
@Controller('room')
export class RoomController {
	constructor(
		private readonly roomService: RoomService
	) {}

	@Post('create-room')
	async CreateRoom(@Req() req: express.Request, @Body() dto: CreateRoomDto) {
		return this.roomService.createRoom(req, dto)
	}
}