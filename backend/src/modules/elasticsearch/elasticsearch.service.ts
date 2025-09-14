import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { OnEvent } from "@nestjs/event-emitter";
import type { Spu } from "@prisma/generated/prisma";

@Injectable()
export class ElasticsearchServiceCustom {
	private readonly logger = new Logger(ElasticsearchServiceCustom.name);

	constructor(
		private readonly es: ElasticsearchService,
		private readonly prismaService: PrismaService
	) { }

	// Event handlers for product synchronization
	@OnEvent('product.created')
	async handleProductCreated(payload: { req: any; newSpu: Spu }) {
		try {
			this.logger.log(`Indexing new product: ${payload.newSpu.id}`);
			await this.indexSpu(payload.newSpu.id);
		} catch (error) {
			this.logger.error(`Failed to index new product ${payload.newSpu.id}`, error);
		}
	}

	@OnEvent('product.updated')
	async handleProductUpdated(spu: Spu) {
		try {
			this.logger.log(`Updating product in index: ${spu.id}`);
			await this.indexSpu(spu.id);
		} catch (error) {
			this.logger.error(`Failed to update product ${spu.id}`, error);
		}
	}

	@OnEvent('product.deleted')
	async handleProductDeleted(payload: { productId: string }) {
		try {
			this.logger.log(`Removing product from index: ${payload.productId}`);
			await this.deleteSpu(payload.productId);
		} catch (error) {
			this.logger.error(`Failed to delete product ${payload.productId}`, error);
		}
	}

	// Core indexing methods
	async indexSpu(spuId: string): Promise<void> {
		const spu = await this.getFullSpuData(spuId);
		if (!spu) {
			this.logger.warn(`SPU ${spuId} not found, skipping indexing`);
			return;
		}

		const document = await this.transformSpuForIndex(spu);

		await this.es.index({
			index: 'spus',
			id: spu.id,
			document,
		});

		// Also index related SKUs
		for (const sku of spu.skus) {
			await this.indexSku(sku.id);
		}

		this.logger.log(`Successfully indexed SPU: ${spuId}`);
	}

	async indexSku(skuId: string): Promise<void> {
		const sku = await this.getFullSkuData(skuId);
		if (!sku) {
			this.logger.warn(`SKU ${skuId} not found, skipping indexing`);
			return;
		}

		const document = await this.transformSkuForIndex(sku);

		await this.es.index({
			index: 'skus',
			id: sku.id,
			document,
		});

		this.logger.log(`Successfully indexed SKU: ${skuId}`);
	}

	async deleteSpu(spuId: string): Promise<void> {
		try {
			// Delete SPU from index
			await this.es.delete({
				index: 'spus',
				id: spuId,
			});

			// Delete related SKUs
			const skuSearchResult = await this.es.search({
				index: 'skus',
				query: {
					term: { spuId }
				}
			});

			for (const hit of skuSearchResult.hits.hits) {
				if (hit._id) {
					await this.es.delete({
						index: 'skus',
						id: hit._id,
					});
				}
			}

			this.logger.log(`Successfully deleted SPU and related SKUs: ${spuId}`);
		} catch (error) {
			if (error.meta?.body?.result === 'not_found') {
				this.logger.warn(`Product ${spuId} not found in index`);
			} else {
				throw error;
			}
		}
	}

	// Data fetching methods
	private async getFullSpuData(spuId: string) {
		return this.prismaService.spu.findUnique({
			where: { id: spuId },
			include: {
				category: true,
				brand: true,
				shop: true,
				skus: {
					include: {
						skuImages: true,
						skuAttributes: {
							include: {
								attribute: true,
								attributeValue: true,
							}
						},
						skuVariationValues: {
							include: {
								spuVariation: {
									include: {
										attribute: true,
									}
								},
								attributeValue: true,
							}
						}
					}
				},
				spuImages: true,
				spuAttributes: {
					include: {
						attribute: true,
						attributeValue: true,
					}
				},
				spuTags: {
					include: {
						tag: true,
					}
				},
				spuVariations: {
					include: {
						attribute: true,
					}
				}
			},
		});
	}

	private async getFullSkuData(skuId: string) {
		return this.prismaService.sku.findUnique({
			where: { id: skuId },
			include: {
				spu: {
					include: {
						category: true,
						brand: true,
						shop: true,
					}
				},
				skuImages: true,
				skuAttributes: {
					include: {
						attribute: true,
						attributeValue: true,
					}
				},
				skuVariationValues: {
					include: {
						spuVariation: {
							include: {
								attribute: true,
							}
						},
						attributeValue: true,
					}
				}
			}
		});
	}

	// Transform methods
	private async transformSpuForIndex(spu: any) {
		const minPrice = spu.skus.length > 0 ? Math.min(...spu.skus.map(sku => Number(sku.originalPrice))) : 0;
		const maxPrice = spu.skus.length > 0 ? Math.max(...spu.skus.map(sku => Number(sku.originalPrice))) : 0;
		const minSalePrice = spu.skus.length > 0 ? Math.min(...spu.skus.filter(sku => sku.salePrice).map(sku => Number(sku.salePrice))) : null;
		const maxSalePrice = spu.skus.length > 0 ? Math.max(...spu.skus.filter(sku => sku.salePrice).map(sku => Number(sku.salePrice))) : null;
		const totalStock = spu.skus.reduce((sum, sku) => sum + sku.stock, 0);

		return {
			id: spu.id,
			name: spu.name,
			slug: spu.slug,
			description: spu.description,
			shortDesc: spu.shortDesc,
			status: spu.status,
			isActive: spu.isActive,
			createdAt: spu.createdAt,
			updatedAt: spu.updatedAt,

			// Relations
			categoryId: spu.categoryId,
			categoryName: spu.category?.name,
			categoryPath: await this.buildCategoryPath(spu.category),
			brandId: spu.brandId,
			brandName: spu.brand?.name,
			shopId: spu.shopId,
			shopName: spu.shop?.name,

			// Images
			images: spu.spuImages?.map(img => ({
				imageUrl: img.imageUrl,
				altText: img.altText,
				isMain: img.isMain,
				sortOrder: img.sortOrder,
			})) || [],

			// Attributes
			attributes: spu.spuAttributes?.map(attr => ({
				attributeId: attr.attributeId,
				attributeName: attr.attribute?.name,
				attributeDisplayName: attr.attribute?.displayName,
				value: attr.attributeValue?.value,
				displayName: attr.attributeValue?.displayName,
				colorCode: attr.attributeValue?.colorCode,
			})) || [],

			// Tags
			tags: spu.spuTags?.map(tag => ({
				id: tag.tag.id,
				name: tag.tag.name,
				slug: tag.tag.slug,
				color: tag.tag.color,
			})) || [],

			// Variations
			variations: spu.spuVariations?.map(variation => ({
				attributeId: variation.attributeId,
				attributeName: variation.attribute?.name,
				values: variation.attribute?.displayName,
			})) || [],

			// Pricing and stock
			minPrice,
			maxPrice,
			minSalePrice,
			maxSalePrice,
			totalStock,
			hasStock: totalStock > 0,
			skuCount: spu.skus.length,
			activeSkuCount: spu.skus.filter(sku => sku.isActive).length,

			// Search optimization
			searchKeywords: `${spu.name} ${spu.brand?.name} ${spu.category?.name} ${spu.description}`.toLowerCase(),
		};
	}

	private async transformSkuForIndex(sku: any) {
		const finalPrice = sku.salePrice ? Number(sku.salePrice) : Number(sku.originalPrice);
		const discountPercentage = sku.salePrice
			? ((Number(sku.originalPrice) - Number(sku.salePrice)) / Number(sku.originalPrice)) * 100
			: 0;

		return {
			id: sku.id,
			skuCode: sku.skuCode,
			name: sku.name,
			originalPrice: Number(sku.originalPrice),
			salePrice: sku.salePrice ? Number(sku.salePrice) : null,
			finalPrice,
			discountPercentage,
			stock: sku.stock,
			weight: sku.weight ? Number(sku.weight) : null,
			dimensions: {
				length: sku.length ? Number(sku.length) : null,
				width: sku.width ? Number(sku.width) : null,
				height: sku.height ? Number(sku.height) : null,
				volume: (sku.length && sku.width && sku.height)
					? Number(sku.length) * Number(sku.width) * Number(sku.height)
					: null,
			},
			status: sku.status,
			isActive: sku.isActive,
			createdAt: sku.createdAt,
			updatedAt: sku.updatedAt,

			// SPU relation
			spuId: sku.spuId,
			spuName: sku.spu?.name,
			spuSlug: sku.spu?.slug,

			// Category and Brand
			categoryId: sku.spu?.categoryId,
			categoryName: sku.spu?.category?.name,
			brandId: sku.spu?.brandId,
			brandName: sku.spu?.brand?.name,
			shopId: sku.spu?.shopId,

			// Images
			images: sku.skuImages?.map(img => ({
				imageUrl: img.imageUrl,
				altText: img.altText,
				isMain: img.isMain,
			})) || [],

			// Attributes
			attributes: sku.skuAttributes?.map(attr => ({
				attributeId: attr.attributeId,
				attributeName: attr.attribute?.name,
				value: attr.attributeValue?.value,
				displayName: attr.attributeValue?.displayName,
				colorCode: attr.attributeValue?.colorCode,
			})) || [],

			// Variation values
			variationValues: sku.skuVariationValues?.map(vv => ({
				attributeId: vv.spuVariation?.attributeId,
				attributeName: vv.spuVariation?.attribute?.name,
				value: vv.attributeValue?.value,
				displayName: vv.attributeValue?.displayName,
				colorCode: vv.attributeValue?.colorCode,
			})) || [],

			// Availability
			isInStock: sku.stock > 0,
			isDiscounted: !!sku.salePrice,
		};
	}

	private async buildCategoryPath(category: any): Promise<string> {
		if (!category) return '';

		const path = [category.name];
		let currentCategory = category;

		while (currentCategory.parentId) {
			const parent = await this.prismaService.category.findUnique({
				where: { id: currentCategory.parentId }
			});
			if (parent) {
				path.unshift(parent.name);
				currentCategory = parent;
			} else {
				break;
			}
		}

		return path.join(' > ');
	}

	// Batch operations
	async batchSyncProducts(): Promise<void> {
		this.logger.log('Starting batch sync of all products...');

		const spus = await this.prismaService.spu.findMany({
			select: { id: true }
		});

		for (const spu of spus) {
			try {
				await this.indexSpu(spu.id);
			} catch (error) {
				this.logger.error(`Failed to index product ${spu.id}`, error);
			}
		}

		this.logger.log('Batch sync completed.');
	}

	// Search methods
	async searchProducts(query: string, filters?: any): Promise<any> {
		return this.es.search({
			index: 'spus',
			query: {
				bool: {
					must: query ? [
						{
							multi_match: {
								query,
								fields: ['name^2', 'description', 'searchKeywords', 'brandName', 'categoryName'],
								type: 'best_fields',
								fuzziness: 'AUTO'
							}
						}
					] : [{ match_all: {} }],
					filter: [
						{ term: { isActive: true } },
						...(filters?.categoryId ? [{ term: { categoryId: filters.categoryId } }] : []),
						...(filters?.brandId ? [{ term: { brandId: filters.brandId } }] : []),
						...(filters?.hasStock ? [{ term: { hasStock: true } }] : []),
						...(filters?.priceRange ? [{
							range: {
								minPrice: {
									gte: filters.priceRange.min,
									lte: filters.priceRange.max
								}
							}
						}] : [])
					]
				}
			},
			sort: [
				{ _score: { order: 'desc' } },
				{ createdAt: { order: 'desc' } }
			]
		});
	}
}
