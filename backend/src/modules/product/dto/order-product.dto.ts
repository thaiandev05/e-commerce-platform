import { TypeOfPayment } from "@prisma/generated/prisma"

export class OrderProductDto {
	productId: string
	voucherIds: string[]
	typeOfPayment: TypeOfPayment = 'INPERSON'
	shopId: string
	quantityProduct: number
}