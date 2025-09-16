import { PrismaService } from "@/prisma/prisma.service";
import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class CartService {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	// create cart object	
	async createUserCart(userId: string) {
		// check available userCart 
		const availableUserCart = await this.prismaService.cart.findUnique({
			where: { ownId: userId }
		})

		if (availableUserCart) throw new ConflictException("UserCart is available")

		// create new usercart
		return await this.prismaService.cart.create({
			data: { ownId: userId }
		})
	}
}