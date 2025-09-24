import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class IsAuthorMessage implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext) {
		// get request in http
		const request = context.switchToHttp().getRequest()

		// get data in request
		const user = request.user
		const messageId = request.params?.messageId || request.query?.messageId

		if (!user || !messageId) throw new BadRequestException("Lost data in request")

		// check available user
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: user.id },
			select: {
				sender: {
					select: { id: true }
				},
				receiver: {
					select: { id: true }
				}
			}
		})
		if (!availableUser) throw new NotFoundException("User not found")

		const haveSenderMessage = availableUser.sender.map(message => message.id).includes(messageId)
		const haveReceiMessage = availableUser.receiver.map(message => message.id).includes(messageId)

		if (!haveReceiMessage && !haveSenderMessage) return false
		return true
	}
}