import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from "express";
@Injectable()
export class CartService {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	private async getUserById(userId: string) {
		if (userId === 'unknow') throw new BadRequestException("System have not receive userId")
		return await this.prismaService.user.findUnique({
			where: { id: userId },
			select: { cart: true }
		})
	}

	private async getProductById(productId: string) {
		if (productId === 'unknow') throw new BadRequestException("System have not receive productId")
		return await this.prismaService.sku.findUnique({ where: { id: productId } })
	}

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

	// store product to cart
	async storeProductToCart(req: Request, productId: string) {
		const availableUser = await this.getUserById(req.user?.id || 'unknow')
		if (!availableUser) throw new NotFoundException("User not Found")

		const availableProduct = await this.getProductById(productId)
		if (!availableProduct) throw new NotFoundException("Product not found")

		if (!availableUser.cart) throw new BadRequestException("User have not cart")

		// add product to cart
		return await this.prismaService.storeProduct.create({
			data: {
				cartId: availableUser.cart.id,
				productId: availableProduct.id
			}
		})
	}
	
}