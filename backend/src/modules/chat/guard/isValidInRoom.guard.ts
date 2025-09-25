import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/generated/prisma";

@Injectable()
export class IsvalidRoomGuard implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext) {
		// get request in http
		const request = context.switchToHttp().getRequest()

		// data in request
		const user: User = request.user
		const roomId: string = request.params?.roomId || request.query?.roomId

		if (!user || !roomId) throw new BadRequestException("User and messageId are required")

		const room = await this.prismaService.room.findFirst({
			where: {
				id: roomId,
				OR: [
					{ clientId: user.id },
					{ supportId: user.id }
				]
			}
		})

		if (!room) return false
		return true
	}
}