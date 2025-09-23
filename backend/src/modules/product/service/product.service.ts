import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SpuStatus, Voucher } from '@prisma/generated/prisma';
import { Request } from 'express';
import { CreateSpuDto } from '../dto/create-spu.dto';
import { OrderProductDto } from '../dto/order-product.dto';
import { UpdateSpuDto } from '../dto/update-spu.dto';
import { ProductSearchService } from './product.search.service';
@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly searchService: ProductSearchService
	) { }
	private async getUserById(userId: string) {
		if (userId === 'unknow') throw new BadRequestException("Userid is not received")
		return await this.prismaService.user.findUnique({
			where: { id: userId }
		})
	}

	private async getSpuById(productId: string) {
		return await this.prismaService.spu.findUnique({ where: { id: productId } })
	}

	public async getSkubyId(productId: string) {
		return await this.prismaService.sku.findUnique({ where: { id: productId } })
	}

	async getCategories() {
		return this.prismaService.category.findMany({
			where: { isActive: true },
			include: { children: true },
			orderBy: { sortOrder: 'asc' }
		})
	}

	async getBrands() {
		return this.prismaService.brand.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' }
		})
	}

	async createSpu(req: Request, dto: CreateSpuDto) {
		// check available user
		const availableUser = await this.getUserById(req.user?.id || 'unkow')
		if (!availableUser) throw new NotFoundException('User not found')

		// create new product 
		const createSpuData = {
			...dto,
			status: dto.status ? SpuStatus[dto.status as keyof typeof SpuStatus] : undefined
		};
		const newSpu = await this.prismaService.spu.create({
			data: createSpuData
		})

		// emit event
		this.eventEmitter.emit('product.created', { req, newSpu })

		return newSpu
	}

	async updateSpu(productId: string, dto: UpdateSpuDto) {
		const newSpu = await this.prismaService.spu.update({
			where: { id: productId },
			data: {
				...(dto.name && { name: dto.name }),
				...(dto.description && { description: dto.description }),
				...(dto.shortDesc && { shortDesc: dto.shortDesc }),
				...(dto.slug && { slug: dto.slug }),
				...(dto.status && { status: dto.status })
			}
		})

		// emit event
		this.eventEmitter.emit('product.updated', newSpu)
		return newSpu
	}

	async deleteSpu(productId: string) {
		await this.prismaService.spu.delete({
			where: { id: productId }
		})

		this.eventEmitter.emit('product.deleted', { productId })
		return true
	}

	// order product
	async orderProduct(req: Request, dto: OrderProductDto) {
		// check available user
		const availableUser = await this.getUserById(req.user?.id || 'unknow')
		if (!availableUser) throw new NotFoundException("User not found")

		// check vailable product
		const availableSkus = await this.getSkubyId(dto.productId)
		if (!availableSkus) throw new NotFoundException("Product not found")
		let listVoucher: Voucher[] = [];
		if (dto.voucherIds) {
			const vouchers = await Promise.all(
				dto.voucherIds.map(voucherId =>
					this.prismaService.voucher.findUnique({ where: { id: voucherId } })
				)
			);
			listVoucher = vouchers.filter((v): v is Voucher => v !== null);
		}

		const productQuantity = availableSkus?.stock || 0;
		if (productQuantity < dto.quantityProduct) {
			throw new BadRequestException("Quantity not enough")
		}

		// ccheck available shop 
		const availableShop = await this.prismaService.shop.findUnique({
			where: { id: dto.shopId }
		})
		if (!availableShop) throw new NotFoundException("Shop not found")

		const basePrice = Number(availableSkus?.salePrice || 0) * dto.quantityProduct;
		const priceAfterApplyVouchers = listVoucher.reduce((acc, voucher) => {
			return acc + (acc * voucher.percentDisCount * 0.01)
		}, basePrice)

		// create order
		const newOrder = await this.prismaService.order.create({
			data: {
				typeOfPayment: dto.typeOfPayment,
				price: priceAfterApplyVouchers,
				ownId: availableUser.id,
				quantity: dto.quantityProduct
			}
		})

		// update voucher used
		await Promise.all(
			listVoucher.map(voucher => {
				this.prismaService.voucherUsed.create({
					data: {
						voucherId: voucher.id,
						orderId: newOrder.id
					}
				})
			})
		)

		const newOrderProduct = await this.prismaService.$transaction([
			this.prismaService.orderProduct.create({
				data: {
					productId: availableSkus.id,
					orderId: newOrder.id,
					shopId: dto.shopId
				}
			}),
			this.prismaService.shop.update({
				where: { id: dto.shopId },
				data: { quantityProduct: BigInt(Number(availableShop?.quantityProduct) - dto.quantityProduct) }
			})
		])

		return newOrderProduct
	}

	async cancelOrder(req: Request, orderProductId: string) {
		//  check availabkle user
		const availableUser = await this.getUserById(req.user?.id || 'unknow')
		if (!availableUser) throw new NotFoundException("User not found")

		// check available orderProduct
		const availableOrderProduct = await this.prismaService.orderProduct.findUnique({
			where: { id: orderProductId }
		})
		if (!availableOrderProduct) throw new NotFoundException("OrderProduct not found")

		// check available order
		const availableOrder = await this.prismaService.order.findUnique({
			where: { id: availableOrderProduct.orderId },
			select: {
				id: true,
				ownId: true,
				quantity: true,
				VoucherUsed: { select: { id: true } }
			}
		})
		if (!availableOrder) throw new NotFoundException("Order is not avaialble")

		// check available shop
		const availableShop = await this.prismaService.shop.findUnique({
			where: { id: availableOrderProduct.shopId }
		})
		if (!availableShop) throw new NotFoundException("Shop not found")

		// check permission 
		if (availableUser.id !== availableOrder.ownId) throw new ForbiddenException("You are not author order")

		// recovery 
		await this.prismaService.$transaction([
			this.prismaService.order.update({
				where: { id: availableOrder.id },
				data: {
					statusOrder: 'CANCEL'
				}
			}),
			this.prismaService.shop.update({
				where: { id: availableShop.id },
				data: {
					quantityProduct: Number(availableShop.quantityProduct) + availableOrder.quantity
				}
			}),
			...availableOrder.VoucherUsed.map(voucher =>
				this.prismaService.voucherUsed.delete({
					where: { id: voucher.id }
				})
			)
		])

		return {
			success: true
		}
	}

	async searchProducts(query?: string, filters?: any) {
		return this.searchService.searchProducts(query || '', filters)
	}

	async fallbackDatabaseSearch(query?: string, filters?: any) {
		return this.searchService.fallbackDatabaseSearch(query, filters)
	}

	async updateReceiveOrder(orderProductId: string) {
		// check avaialble orderProduct
		const availableOrderProduct = await this.prismaService.orderProduct.findUnique({
			where: { id: orderProductId }
		})
		if (!availableOrderProduct) throw new NotFoundException("OrderProduct not found")

		return await this.prismaService.order.update({
			where: { id: availableOrderProduct.orderId },
			data: { statusOrder: 'RECEIVED' }
		})
	}

	async getOrder(userId: string, orderId: string) {
		// check availableuser
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: {
				Order: {
					select: { id: true }
				}
			}
		})
		console.log(availableUser)
		if (!availableUser) throw new NotFoundException("User not found")

		// check avaiable order
		const avaiableOrder = await this.prismaService.order.findUnique({ where: { id: orderId } })
		if (!avaiableOrder) throw new NotFoundException("Order not found")

		// check permission
		if (!availableUser.Order.map(order => order.id).includes(orderId)) {
			throw new ForbiddenException("You are not author order")
		}

		return avaiableOrder
	}
}
