import { CartService } from "@/modules/cart/cart.service";
import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class CheckoutAndCart {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cartService: CartService,
	) { }

	private readonly checkOutAndCart = new Map<string, string>([
		['add_product_to_cart',
			`Tại trang sản phẩm, nhấn “Thêm vào giỏ” để đưa sản phẩm vào giỏ hàng.
		Bạn có thể chọn màu, kích thước và số lượng trước khi thêm.
		Sau khi thêm thành công, hệ thống sẽ hiển thị thông báo và biểu tượng giỏ ở góc trên bên phải sẽ cập nhật số lượng.
		Bạn cũng có thể cho tôi ID của sản phẩm để hỗ trợ thêm cho bạn`
		],
		['check_out_cart',
			`Nhấn vào biểu tượng giỏ hàng để xem tổng số mục, tổng tiền tạm tính, và danh sách sản phẩm.
			Mỗi mục hiển thị: ảnh, tên, biến thể (nếu có), đơn giá, số lượng, và thành tiền tạm tính.
			Có nút “Tiếp tục mua sắm” và “Thanh toán”.'
			Hoặc nhấn vào nút hiển thị bên dưới để vào giỏ hanfng một cách trực tiếp
			`,
		],
		[`update_quantity_product`,
			`Tại giỏ hàng, bấm + / − để tăng/giảm số lượng. Nhấn “Xóa” để xóa mục.
			Nếu số lượng vượt quá tồn kho, hệ thống sẽ thông báo: “Số lượng hiện chỉ còn X cái”.
			Sau thay đổi, tổng tiền sẽ được cập nhật tự động.
			Hoặc bấm vào nút dưới để tôi giúp bạn thêm số lượng
			'`
		]
	])

	private async storeProductToCart(userId: string, productId: string, quantity: number) {
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: { cart: true }
		})
		if (!availableUser) throw new NotFoundException("User not Found")

		const availableProduct = await this.prismaService.sku.findUnique({ where: { id: productId } })
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

	async handleCheckout(
		checkout_prompt: string,
		userId: string,
		productId: string,
		cartId: string,
		storeProductId: string,
		quantity: number
	) {
		switch (checkout_prompt) {
			case 'add_product_to_cart': {
				if (!userId || !productId || !quantity) {
					throw new BadRequestException('userId, productId và quantity là bắt buộc để thêm vào giỏ hàng');
				}
				const message = this.checkOutAndCart.get('add_product_to_cart') || '';
				const product = await this.storeProductToCart(userId, productId, quantity);
				return {
					message,
					product
				};
			}
			case 'check_out_cart': {
				const message = this.checkOutAndCart.get('check_out_cart') || '';
				const cartInfo = await this.cartService.checkCart(userId);
				return {
					message,
					cart: cartInfo
				};
			}
			case 'update_quantity_product': {
				const message = this.checkOutAndCart.get('update_quantity_product') || '';
				const result = await this.cartService.updateQuantityProductInCart(userId, cartId, storeProductId, quantity);
				return {
					message,
					result
				};
			}
			default:
				throw new BadRequestException('Checkout prompt không hợp lệ');
		}
	}


}