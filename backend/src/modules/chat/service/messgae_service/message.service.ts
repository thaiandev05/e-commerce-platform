import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Message, User } from "@prisma/generated/prisma";
import { randomUUID } from "crypto";
import { Request } from 'express';
import Redis from "ioredis";
import { CHAT_CONSTANR } from "../../chat.constant";
import { CreateMessageDto } from "../../dto/create-message.dto";
import { UpdateMessageDto } from "../../dto/update-message.dto";
import { DeleteMessageDto } from "../../dto/delete-message.dto";
import { LoadingAndSearchService } from "./loading-search.message.service";
import { LoadingMessageDto } from "../../dto/loading-message.dto";
import { FindingMessageDto } from "../../dto/finding-message.dto";
import { MessageProducer } from "./handle_queue/message.producer";
@Injectable()
export class MessageService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
		private readonly messageProducer: MessageProducer,
		private readonly loadMessageService: LoadingAndSearchService
	) { }

	// check available user
	async getUserWithId(key: string) {
		// check available in cache
		const cache = await this.redis.get(key)
		if (cache && cache !== '__NULL__') return JSON.parse(cache) as User

		const userId = key.split('user:').join('')
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: { id: true, username: true } // Only needed fields
		})

		if (user) await this.redis.set(key, JSON.stringify(user))
		else await this.redis.set(key, '__NULL__')
	}

	// check available room
	async getRoomWithId(roomId: string) {
		return await this.prismaService.room.findUnique({ where: { id: roomId } })
	}

	// check available message
	async getMessageWithId(messageId: string) {
		return await this.prismaService.message.findUnique({ where: { id: messageId } })
	}

	// validate room
	async validateUserInRoom(roomId: string, userId: string) {
		const room = await this.prismaService.room.findFirst({
			where: {
				id: roomId,
				OR: [
					{ clientId: userId },
					{ supportId: userId }
				]
			}
		});

		if (!room) {
			throw new BadRequestException("Room not found or user not in conversation");
		}
		return room;
	}

	// create messgae
	async createMessage(req: Request, dto: CreateMessageDto) {
		const senderId = req.user?.id || 'unknow'
		const senderKey = CHAT_CONSTANR.CACHE_USER(senderId)
		const receiverKey = CHAT_CONSTANR.CACHE_USER(dto.receiverId)
		const [sender, receiver, room] = await Promise.all([
			this.getUserWithId(senderKey),
			this.getUserWithId(receiverKey),
			this.getRoomWithId(dto.roomId)
		])
		if (!sender) throw new NotFoundException("Sender not found")
		if (!receiver) throw new NotFoundException("Receiver not found")
		if (!room) throw new NotFoundException("Room not found")

		// check reply
		let repToUser
		if (dto.isRepLy) {
			repToUser = receiver.id
		}

		// check available in room
		await this.validateUserInRoom(dto.roomId, sender.id)

		const messageId = randomUUID()
		const message = {
			id: messageId,
			content: dto.content,
			roomId: room.id,
			senderId: sender.id,
			receiverId: receiver.id,
			repToId: repToUser ?? null
		}

		// emit event to producer 
		await this.messageProducer.sendMessageEvent(message)
		return {
			messageId,
			message: 'Message queued'
		}
	}

	// update message
	async updateMessage(dto: UpdateMessageDto, messageId: string): Promise<Message> {
		// validate
		const room = await this.getRoomWithId(dto.roomId)
		if (!room) throw new NotFoundException("Room not found")

		let message
		if (dto.isRepLy) {
			message = await this.prismaService.message.findUnique({
				where: { id: messageId, isMessageReply: true }
			})
		} else {
			message = await this.getMessageWithId(messageId)
		}
		if (!message) throw new NotFoundException("Message not found")

		// update new Message
		return await this.prismaService.message.update({
			where: { id: message.id },
			data: {
				content: dto.newContent
			}
		})
	}

	// delete message
	async deleteMessage(messageId: string, dto: DeleteMessageDto) {
		let message
		if (dto.isRepLy) {
			message = await this.prismaService.message.findUnique({
				where: { id: messageId, isMessageReply: true }
			})
		} else {
			message = await this.getMessageWithId(messageId)
		}
		if (!message) throw new NotFoundException("Message not found")

		// delete
		return await this.prismaService.message.delete({
			where: { id: messageId }
		})
	}

	// loading messages
	async loadingMessage(req: Request, roomId: string, dto: LoadingMessageDto) {
		return this.loadMessageService.loadingMessage(req, roomId, dto)
	}

	// finding messages
	async findingMessages(req: Request, roomId: string, dto: FindingMessageDto) {
		return this.loadMessageService.findingMessage(req, roomId, dto)
	}

	// mark seen 
	async makeSeenMessage(req: Request, roomId: string, messageId: string) {
		// validate
		const room = await this.getRoomWithId(roomId)
		if (!room) throw new NotFoundException("Room not found")

		// check available message
		const message = await this.prismaService.message.findUnique({ where: { id: messageId } })
		if (!message) throw new NotFoundException("Message not found")

		const userId = req.user?.id
		const isClient = (room.clientId === userId) ? true : false

		// update index user
		if (isClient) {
			return await this.prismaService.room.update({
				where: { id: room.id },
				data: {
					lastMessageClientIndex: messageId
				}
			})
		}

		return await this.prismaService.room.update({
			where: { id: room.id },
			data: {
				lastMessageSupportIndex: messageId
			}
		})
	}
}