import { Controller, Param, Post } from "@nestjs/common";
import { CartService } from "./cart.service";
import { Public } from "@/common/decorator/public.decorator";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";

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
}