import { PrismaService } from "@/prisma/prisma.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class IsAuthorCartGuard implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext) {
		// get request
		const request = context.switchToHttp().getRequest()

		// get element in request
		const user = request.user
		const cardId = request.params?.cartId || request.query?.cartId

		


		if (!user || !cardId) throw new ForbiddenException("In error in guard author cart")

		// check available user
		const availableuUser = await this.prismaService.user.findUnique({
			where: { id: user.id },
			select: {
				cart: {
					select: {
						id: true
					}
				}
			}
		})
		if (!availableuUser) throw new NotFoundException("User not found")

		// check permission access cart
		if (availableuUser.cart?.id !== cardId) {
			throw new ForbiddenException("You are not author cart")
		}

		return true
	}

}