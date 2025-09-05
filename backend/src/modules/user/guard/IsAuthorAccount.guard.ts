import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/generated/prisma";
import { Observable } from "rxjs";

@Injectable()
export class IsAuthorAccount implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const user: User = request.user
		const accountId: string = request.query?.accountId || request.params?.accountId
		if (!user || !accountId) throw new BadRequestException("Erron in get user in request")

		// check availabe Account
		const availableAccount = await this.prismaService.user.findUnique({
			where: { id: accountId }
		})

		if (!availableAccount) throw new NotFoundException("Account not found")

		// check user in request available
		const availableRequestUser = await this.prismaService.user.findUnique({
			where: { id: user.id }
		})

		if (!availableRequestUser) throw new NotFoundException("Account not found")

		return (availableAccount.id !== availableRequestUser.id) ? false : true
	}
}