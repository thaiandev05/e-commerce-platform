import { TypeOfPayment } from "@prisma/generated/prisma";
import { ApiProperty } from "@nestjs/swagger";

export class OrderProductDto {
	@ApiProperty({ description: 'ID of the product to order', example: 'product-12345' })
	productId: string;

	@ApiProperty({ description: 'IDs of applicable vouchers', example: ['voucher-1', 'voucher-2'], isArray: true })
	voucherIds: string[];

	@ApiProperty({ description: 'Type of payment for the order', example: 'INPERSON', enum: TypeOfPayment, default: 'INPERSON' })
	typeOfPayment: TypeOfPayment = 'INPERSON';

	@ApiProperty({ description: 'ID of the shop where the product is ordered from', example: 'shop-67890' })
	shopId: string;

	@ApiProperty({ description: 'Quantity of the product to order', example: 2 })
	quantityProduct: number;

	@ApiProperty({ description: 'Delivery address for the order', example: '123 Main Street, City, Country' })
	deliveryAddress: string;

	@ApiProperty({ description: 'Additional notes or instructions for the order', example: 'Please deliver between 9 AM and 5 PM' })
	customerNotes?: string;

	@ApiProperty({ description: 'Preferred delivery date', example: '2025-09-20' })
	deliveryDate?: string;
}