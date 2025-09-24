import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from 'express'
import { CreateMessageDto } from "../dto/create-message.dto";
import { Message } from "@prisma/generated/prisma";
@Injectable()
export class MessageService {

	constructor(
		private readonly prismaService: PrismaService
	) { }
	// check available user
	async getUserWithId(userId: string) {
		if (userId === 'unknow') throw new BadRequestException("Non user request")
		return await this.prismaService.user.findUnique({ where: { id: userId } })
	}

	// check available room
	async getRoomWithId(roomId: string) {
		return await this.prismaService.room.findUnique({ where: { id: roomId } })
	}

	// create messgae
	async createMessage(req: Request, dto: CreateMessageDto): Promise<Message> {
		// check available user
		const senderId = req.user?.id || 'unknow'
		const sender = await this.getUserWithId(senderId)
		if (!sender) throw new NotFoundException("Sender not found")

		const receiver = await this.getUserWithId(dto.receiverId)
		if (!receiver) throw new NotFoundException("Receiver not found")

		// check available room
		const room = await this.getRoomWithId(dto.roomId)
		if (!room) throw new NotFoundException("Room not found")

		// check reply
		let repToUser
		if (dto.isRepLy) {
			repToUser = receiver.id
		}

		// check available in room
		if (room.clientId !== sender.id && room.supportId !== sender.id) {
			throw new BadRequestException("One of user have not in this conversation")
		}

		// create message 
		const newMessage = await this.prismaService.message.create({
			data: {
				content: dto.content,
				roomId: room.id,
				senderId: sender.id,
				receiverId: receiver.id,
				...(repToUser && { repToId: repToUser })
			}
		})

		return newMessage
	}
}