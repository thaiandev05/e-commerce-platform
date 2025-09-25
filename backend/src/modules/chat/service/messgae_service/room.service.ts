import { PrismaService } from "@/prisma/prisma.service";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from 'express';
import Redis from "ioredis";
import { CHAT_CONSTANR } from "../../chat.constant";
import { User_Custom } from "../../interface/chat.interface";
import { CreateRoomDto } from "../../dto/create-room.dto";
@Injectable()
export class RoomService {

	constructor(
		private readonly prismaService: PrismaService,
		@Inject("REDIS_CLIENT") private readonly redis: Redis
	) { }

	// check available user
	async getUserWithId(key: string) {
		// check available in cache
		const cache = await this.redis.get(key)
		if (cache && cache !== '__NULL__') return JSON.parse(cache) as User_Custom
		const userId = key.split('user:').join('')
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: {
				id: true, username: true,
				roles: {
					select: {
						role: {
							select: {
								roleName: true
							}
						}
					}
				}
			} // Only needed fields
		})

		if (user) await this.redis.set(key, JSON.stringify(user))
		else await this.redis.set(key, '__NULL__')
	}

	// check available room
	async getRoomWithId(supportId: string, clientId: string) {
		return await this.prismaService.room.findUnique({ where: { supportId_clientId: { supportId, clientId } } })
	}

	async createRoom(req: Request, dto: CreateRoomDto) {
		// check available 
		const [requestUser, otherUser] = await Promise.all([
			this.getUserWithId(req.user?.id || 'unkow'),
			this.getUserWithId(dto.otherUserId)
		])
		if (!requestUser) throw new NotFoundException("Requester not found")
		if (!otherUser) throw new NotFoundException("Other user not found")

		const rolesUser = requestUser.roles.some(role => role.role.roleName === 'CLIENT')
		let clientId, supportId
		if (rolesUser) {
			clientId = requestUser.id
			supportId = dto.otherUserId
		}
		clientId = otherUser.id
		supportId = requestUser.id

		// check available room 
		const room = await this.prismaService.room.findUnique({
			where: { supportId_clientId: { supportId, clientId } }
		})
		if (room) throw new ConflictException("Room is available")

		// create new room
		const socketRoomId = CHAT_CONSTANR.NAME_SOCKET_ROOM(clientId, supportId)
		const newRoom = await this.prismaService.room.create({
			data: {
				socketRoomId,
				supportId,
				clientId
			}
		})

		return newRoom
	}
}