import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/generated/prisma";

@Injectable()
export class IsAuthorMessage implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// get request in http
		const request = context.switchToHttp().getRequest()

		// get data in request
		const user: User = request.user
		const messageId: string = request.params?.messageId || request.query?.messageId

		if (!user || !messageId) {
			throw new BadRequestException("User and messageId are required")
		}

		// check if user exists and get their messages
		const userWithMessages = await this.prismaService.user.findUnique({
			where: { id: user.id },
			select: {
				sender: true,
				receiver: true
			}
		})

		if (!userWithMessages) {
			throw new NotFoundException("User not found")
		}

		// check if user is sender or receiver of the message
		const isSender = userWithMessages.sender.some(message => message.id === messageId)
		const isReceiver = userWithMessages.receiver.some(message => message.id === messageId)

		return isSender || isReceiver
	}
}