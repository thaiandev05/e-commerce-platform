import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/role.decorator";
import { User } from "@prisma/generated/prisma";
import { ForbiddenError } from "@nestjs/apollo";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext) {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		)

		console.log(requiredRoles)

		// controller not required reole
		if (!requiredRoles) return true
		const request = context.switchToHttp().getRequest()
		const user: User = request.user

		if (!user) throw new ForbiddenError("User not auth")

		// get list roles
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: user.id },
			include: {
				roles: true
			}
		})
		console.log(availableUser)

		const userRoleIds = availableUser?.roles.map(role => role.roleId) ?? [];
		const hasRole = requiredRoles.some(role => userRoleIds.includes(role));

		if (!hasRole) {
			throw new ForbiddenException(
				`You do not have permission. Required: ${requiredRoles.join(', ')}`
			)
		}
		return true;
	}
}