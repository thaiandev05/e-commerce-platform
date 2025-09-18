import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SpuStatus, Voucher, VoucherUsed } from '@prisma/generated/prisma';
import { Request } from 'express';
import { ElasticsearchServiceCustom } from '../elasticsearch/elasticsearch.service';
import { CreateSpuDto } from './dto/create-spu.dto';
import { UpdateSpuDto } from './dto/update-spu.dto';
import { OrderProductDto } from './dto/order-product.dto';
@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly elasticsearchService: ElasticsearchServiceCustom
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

	private async getSkubyId(productId: string) {
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

	async searchProducts(query?: string, filters?: any) {
		try {
			const searchResult = await this.elasticsearchService.searchProducts(query || '', filters);

			return {
				total: searchResult.hits.total.value,
				page: filters?.page || 1,
				limit: filters?.limit || 20,
				results: searchResult.hits.hits.map(hit => ({
					...hit._source,
					score: hit._score
				}))
			};
		} catch (error) {
			// Fallback to database search if Elasticsearch fails
			console.error('Elasticsearch search failed, falling back to database:', error);
			return this.fallbackDatabaseSearch(query, filters);
		}
	}

	private async fallbackDatabaseSearch(query?: string, filters?: any) {
		const where: any = {
			isActive: true,
			...(filters?.categoryId && { categoryId: filters.categoryId }),
			...(filters?.brandId && { brandId: filters.brandId }),
			...(query && {
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ description: { contains: query, mode: 'insensitive' } },
					{ brand: { name: { contains: query, mode: 'insensitive' } } },
					{ category: { name: { contains: query, mode: 'insensitive' } } }
				]
			})
		};

		const [spus, total] = await Promise.all([
			this.prismaService.spu.findMany({
				where,
				include: {
					category: true,
					brand: true,
					shop: true,
					spuImages: true,
					skus: {
						where: { isActive: true },
						select: {
							originalPrice: true,
							salePrice: true,
							stock: true
						}
					}
				},
				skip: ((filters?.page || 1) - 1) * (filters?.limit || 20),
				take: filters?.limit || 20,
				orderBy: { timeAccess: 'desc' }
			}),
			this.prismaService.spu.count({ where })
		]);

		return {
			total,
			page: filters?.page || 1,
			limit: filters?.limit || 20,
			results: spus.map(spu => ({
				id: spu.id,
				name: spu.name,
				slug: spu.slug,
				description: spu.description,
				categoryName: spu.category?.name,
				brandName: spu.brand?.name,
				shopName: spu.shop?.name,
				images: spu.spuImages || [],
				minPrice: spu.skus.length > 0 ? Math.min(...spu.skus.map(sku => Number(sku.originalPrice))) : 0,
				maxPrice: spu.skus.length > 0 ? Math.max(...spu.skus.map(sku => Number(sku.originalPrice))) : 0,
				totalStock: spu.skus.reduce((sum, sku) => sum + sku.stock, 0),
				hasStock: spu.skus.reduce((sum, sku) => sum + sku.stock, 0) > 0
			}))
		};
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
				price: priceAfterApplyVouchers
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
				data: { quantityProduct: Number(availableShop?.quantityProduct) - dto.quantityProduct }
			})
		])

		return newOrderProduct
	}
}
