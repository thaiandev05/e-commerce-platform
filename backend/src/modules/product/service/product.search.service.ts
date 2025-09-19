import { ElasticsearchServiceCustom } from "@/modules/elasticsearch/elasticsearch.service";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductSearchService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly elasticsearchService: ElasticsearchServiceCustom
	) { }

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

	async fallbackDatabaseSearch(query?: string, filters?: any) {
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
}