import { PrismaService } from "@/prisma/prisma.service";
import { BadGatewayException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/generated/prisma";

@Injectable()
export class IsAuthorProductGuard implements CanActivate {
	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()
		const user: User = request.user
		const productId: string = request.query?.productId || request.params?.productId

		// validate data
		if (!user || !productId) throw new BadGatewayException('Information not enough')

		// find available product
		const avaialbleProduct = await this.prismaService.spu.findUnique({
			where: { id: productId }
		})

		if (!avaialbleProduct) throw new NotFoundException('Product not found')

		// find available user
		const availableUseruser = await this.prismaService.user.findUnique({
			where: { id: user.id },
			include: {
				shops: {
					select: {
						id: true
					}
				}
			}
		})

		if (!availableUseruser) throw new NotFoundException("user not found")

		const listShopId = availableUseruser.shops
		const isAuthorShop = listShopId.some(shop => shop.id === avaialbleProduct.shopId)

		return isAuthorShop
	}
}