import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
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

	// load cart
	async checkCart(userId: string) {
		return await this.prismaService.cart.findUnique({
			where: { ownId: userId }
		})
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
	async storeProductToCart(req: Request, productId: string, quantity: number) {
		const availableUser = await this.getUserById(req.user?.id || 'unknow')
		if (!availableUser) throw new NotFoundException("User not Found")

		const availableProduct = await this.getProductById(productId)
		if (!availableProduct) throw new NotFoundException("Product not found")

		if (!availableUser.cart) throw new BadRequestException("User have not cart")

		// add product to cart
		return await this.prismaService.storeProduct.create({
			data: {
				cartId: availableUser.cart.id,
				productId: availableProduct.id,
				quantity: quantity
			}
		})
	}

	// delete product in cart
	async deleteProductInCard(req: Request, cartId: string, storeProductId: string) {
		// check avaialbe cart
		const availableCart = await this.prismaService.cart.findUnique({
			where: { id: cartId }
		})
		if (!availableCart) throw new NotFoundException("Cart is not found")

		// check available is available store product
		const availableStoreProduct = await this.prismaService.storeProduct.findUnique({
			where: { id: storeProductId }
		})
		if (!availableStoreProduct) throw new NotFoundException("StoreProduct not found")

		// remove
		return await this.prismaService.storeProduct.delete({
			where: { id: storeProductId }
		})
	}

	// update quantity product in cart
	async updateQuantityProductInCart(userId: string, cartId: string, storeProductId: string, quantity: number) {
		const availableUser = await this.getUserById(userId)
		if (!availableUser) throw new NotFoundException("User not found")

		const avaialbeCart = await this.prismaService.cart.findUnique({
			where: { id: cartId },
			select: {
				id: true,
				storeProducts: {
					select: { id: true }
				}
			}
		})
		if (!avaialbeCart) throw new NotFoundException("Cart not exist")

		// ccheck permission
		if (avaialbeCart.id !== availableUser.cart?.id) {
			throw new ForbiddenException("You are not author cart")
		}

		// check product is in cart
		if (!avaialbeCart.storeProducts.map(product => product.id).includes(storeProductId)) {
			throw new NotFoundException("Product not found in cart")
		}

		// update quantity
		return await this.prismaService.storeProduct.update({
			where: { id: storeProductId },
			data: {
				quantity: quantity
			}
		})
	}
}