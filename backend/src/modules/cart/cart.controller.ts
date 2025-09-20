import { Body, Controller, Delete, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { Public } from "@/common/decorator/public.decorator";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import express from "express";
import { IsAuthorCartGuard } from "./IsAuthorCart.guard";

@ApiTags('Cart')
@Controller("cart")
export class CartController {

	constructor(
		private readonly cartService: CartService
	) { }

	@Public()
	@Post(':userId')
	@ApiOperation({ summary: 'Create user cart' })
	@ApiCreatedResponse({ description: 'Create successful' })
	@ApiBadRequestResponse({ description: 'Invalid create cart' })
	async createUserCart(@Param('userId') userId: string) {
		return this.cartService.createUserCart(userId)
	}

	@Post('store-product-to-cart')
	@ApiOperation({ summary: 'Store product to cart' })
	@ApiResponse({ status: 200, description: 'Product stored successfully' })
	@ApiBadRequestResponse({ description: 'Invalid product or quantity' })
	@ApiBody({ schema: { properties: { quantity: { type: 'number' } } } })
	async storeProductToCart(@Req() req: express.Request, @Query('productId') productId: string, @Body('quantity') quantity: number) {
		return this.cartService.storeProductToCart(req, productId, quantity)
	}

	@Delete('remove-store-product')
	@UseGuards(IsAuthorCartGuard)
	@ApiOperation({ summary: 'Remove product from cart' })
	@ApiResponse({ status: 200, description: 'Product removed successfully' })
	@ApiBadRequestResponse({ description: 'Invalid product ID' })
	async removeStoreProduct(@Req() req: express.Request,@Query('cartId')cartId: string, @Query('storeProductId') storeProductId: string) {
		return this.cartService.deleteProductInCard(req,cartId,  storeProductId)
	}
}