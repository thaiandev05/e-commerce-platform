import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SpuStatus } from '@prisma/generated/prisma';
import { Request } from 'express';
import { ElasticsearchServiceCustom } from '../elasticsearch/elasticsearch.service';
import { CreateSpuDto } from './dto/create-spu.dto';
import { UpdateSpuDto } from './dto/update-spu.dto';
@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2,
		private readonly elasticsearchService: ElasticsearchServiceCustom
	) { }


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
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: req.user?.id }
		})
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
				orderBy: { createdAt: 'desc' }
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

}
