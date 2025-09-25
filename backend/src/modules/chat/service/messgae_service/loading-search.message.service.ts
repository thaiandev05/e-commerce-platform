import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from 'express'
import { LoadingMessageDto } from "../../dto/loading-message.dto";
import { PrismaService } from "@/prisma/prisma.service";
import { CHAT_CONSTANR } from "../../chat.constant";
import Redis from "ioredis";
@Injectable()
export class LoadingAndSearchService {

	constructor(
		private readonly prismaService: PrismaService,
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
	) { }

	// loading message
	async loadingMessage(req: Request, roomId: string, dto: LoadingMessageDto) {
		// check available user
		const userId = req.user?.id || 'unknow'
		const user = await this.prismaService.user.findUnique({
			where: { id: userId }
		})
		if (!user) throw new NotFoundException("User not found")

		// get cache
		const messageRoomKey = CHAT_CONSTANR.CACHE_MESSAGE_ROOM(roomId)
		const cacheKey = `${messageRoomKey}:${dto?.page || 1}:${dto?.limit || 20}:${dto?.cursor || ''}`
		const cache = await this.redis.get(cacheKey)
		if (cache && cache !== '_NULL_') {
			return JSON.parse(cache)
		}

		// fall back to db 
		const page = dto?.page || 1
		const take = dto?.limit || 20
		const skip = dto?.skip || (page - 1) * take

		let query: any = {
			where: {
				roomId: roomId
			},
			include: {
				sender: {
					select: {
						id: true,
						fullname: true,
						username: true,
						avatarUrl: true
					}
				},
				receiver: {
					select: {
						id: true,
						fullname: true,
						username: true,
						avatarUrl: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		}

		if (dto?.isUseCursor && dto?.cursor) {
			query.take = take + 1 // Take one extra to check if there are more
			query.cursor = {
				id: dto.cursor
			}
			query.skip = 1 // Skip the cursor itself
		} else {
			query.take = take
			query.skip = skip
		}

		// query messages
		const messages = await this.prismaService.message.findMany(query)

		let hasNextPage = false
		let nextCursor: string | null = null

		if (dto?.isUseCursor && messages.length > take) {
			hasNextPage = true
			messages.pop() // Remove the extra message
			nextCursor = messages[messages.length - 1]?.id || null
		} else if (!dto?.isUseCursor) {
			// For offset pagination, check if there are more messages
			const totalCount = await this.prismaService.message.count({
				where: { roomId: roomId }
			})
			hasNextPage = skip + take < totalCount
		}

		const result = {
			data: messages,
			pagination: {
				page: dto?.isUseCursor ? null : page,
				limit: take,
				hasNextPage,
				nextCursor: dto?.isUseCursor ? nextCursor : null,
				total: dto?.isUseCursor ? null : await this.prismaService.message.count({
					where: { roomId: roomId }
				})
			}
		}

		if (messages.length === 0) {
			// save empty cache
			await this.redis.setex(cacheKey, 300, '_NULL_') // Cache for 5 minutes
			throw new NotFoundException("Conversation has no messages")
		}

		// save to cache for 5 minutes
		await this.redis.setex(cacheKey, 300, JSON.stringify(result))

		return result
	}
}