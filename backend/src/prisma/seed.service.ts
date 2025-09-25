import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ElasticsearchServiceCustom } from '../modules/elasticsearch/elasticsearch.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SeedService {
	private readonly logger = new Logger(SeedService.name);

	constructor(
		private readonly prismaService: PrismaService,
		private readonly elasticsearchService: ElasticsearchServiceCustom,
		private readonly es: ElasticsearchService
	) { }

	/**
	 * Enhanced seed method with Elasticsearch sync options
	 */
	async seedWithElasticsearch(options: {
		clearElasticsearchFirst?: boolean;
		batchSize?: number;
	} = {}) {
		const {
			clearElasticsearchFirst = true,
			batchSize = 10
		} = options;

		try {
			if (clearElasticsearchFirst) {
				console.log('🗑️  Clearing existing Elasticsearch data...');
				await this.clearElasticsearchData();
			}

			// Run the regular seed
			console.log('🌱 Starting database seeding...');
			await this.prismaService.seed();

			// Sync to Elasticsearch
			console.log('🔍 Starting Elasticsearch sync...');
			await this.syncToElasticsearch();
			console.log('✅ Elasticsearch sync completed!');

		} catch (error) {
			this.logger.error('Failed to seed with Elasticsearch:', error);
			throw error;
		}
	}

	/**
	 * Sync all seeded data to Elasticsearch
	 */
	async syncToElasticsearch(): Promise<void> {
		try {
			await this.createElasticsearchIndices();
			await this.syncCategoriesToES();
			await this.syncBrandsToES();
			await this.syncShopsToES();
			await this.syncProductsToES();
			await this.syncUsersToES();
		} catch (error) {
			this.logger.error('Failed to sync data to Elasticsearch:', error);
			throw error;
		}
	}

	/**
	 * Create Elasticsearch indices with proper mappings
	 */
	private async createElasticsearchIndices(): Promise<void> {
		const indices = ['spus', 'skus', 'categories', 'brands', 'shops', 'users'];

		for (const index of indices) {
			try {
				const exists = await this.es.indices.exists({ index });
				if (!exists) {
					await this.es.indices.create({
						index,
						mappings: this.getIndexMapping(index)
					});
					this.logger.log(`Created Elasticsearch index: ${index}`);
				}
			} catch (error) {
				this.logger.error(`Failed to create index ${index}:`, error);
			}
		}
	}

	/**
	 * Get mapping configuration for different indices
	 */
	private getIndexMapping(index: string): any {
		const commonMapping = {
			properties: {
				id: { type: 'keyword' },
				name: {
					type: 'text',
					analyzer: 'standard',
					fields: {
						keyword: { type: 'keyword' },
						suggest: { type: 'completion' }
					}
				},
				slug: { type: 'keyword' },
				isActive: { type: 'boolean' },
				createdAt: { type: 'date' },
				updatedAt: { type: 'date' }
			}
		};

		switch (index) {
			case 'spus':
				return {
					properties: {
						...commonMapping.properties,
						description: { type: 'text' },
						shortDesc: { type: 'text' },
						status: { type: 'keyword' },
						categoryId: { type: 'keyword' },
						categoryName: { type: 'text' },
						brandId: { type: 'keyword' },
						brandName: { type: 'text' },
						shopId: { type: 'keyword' },
						shopName: { type: 'text' },
						minPrice: { type: 'double' },
						maxPrice: { type: 'double' },
						totalStock: { type: 'integer' },
						hasStock: { type: 'boolean' },
						searchKeywords: { type: 'text' }
					}
				};
			case 'skus':
				return {
					properties: {
						...commonMapping.properties,
						skuCode: { type: 'keyword' },
						originalPrice: { type: 'double' },
						salePrice: { type: 'double' },
						finalPrice: { type: 'double' },
						stock: { type: 'integer' },
						spuId: { type: 'keyword' },
						isInStock: { type: 'boolean' }
					}
				};
			case 'categories':
				return {
					properties: {
						...commonMapping.properties,
						description: { type: 'text' },
						parentId: { type: 'keyword' },
						sortOrder: { type: 'integer' }
					}
				};
			case 'brands':
				return {
					properties: {
						...commonMapping.properties,
						description: { type: 'text' },
						logoUrl: { type: 'keyword' },
						websiteUrl: { type: 'keyword' }
					}
				};
			case 'shops':
				return {
					properties: {
						...commonMapping.properties,
						description: { type: 'text' },
						email: { type: 'keyword' },
						phone: { type: 'keyword' },
						address: { type: 'text' },
						status: { type: 'keyword' },
						rating: { type: 'double' },
						totalReviews: { type: 'integer' },
						isVerified: { type: 'boolean' }
					}
				};
			case 'users':
				return {
					properties: {
						...commonMapping.properties,
						fullname: { type: 'text' },
						username: { type: 'keyword' },
						email: { type: 'keyword' },
						city: { type: 'text' },
						state: { type: 'text' },
						isVerified: { type: 'boolean' }
					}
				};
			default:
				return commonMapping;
		}
	}

	/**
	 * Sync categories to Elasticsearch
	 */
	private async syncCategoriesToES(): Promise<void> {
		this.logger.log('Syncing categories to Elasticsearch...');

		const categories = await this.prismaService.category.findMany({
			orderBy: { createdAt: 'asc' }
		});

		const operations: any[] = [];
		for (const category of categories) {
			operations.push(
				{ index: { _index: 'categories', _id: category.id } },
				{
					id: category.id,
					name: category.name,
					slug: category.slug,
					description: category.description,
					imageUrl: category.imageUrl,
					isActive: category.isActive,
					sortOrder: category.sortOrder,
					createdAt: category.createdAt,
					updatedAt: category.updatedAt
				}
			);
		}

		if (operations.length > 0) {
			await this.es.bulk({ operations });
			this.logger.log(`Synced ${categories.length} categories to Elasticsearch`);
		}
	}

	/**
	 * Sync brands to Elasticsearch
	 */
	private async syncBrandsToES(): Promise<void> {
		this.logger.log('Syncing brands to Elasticsearch...');

		const brands = await this.prismaService.brand.findMany({
			orderBy: { createdAt: 'asc' }
		});

		const operations: any[] = [];
		for (const brand of brands) {
			operations.push(
				{ index: { _index: 'brands', _id: brand.id } },
				{
					id: brand.id,
					name: brand.name,
					slug: brand.slug,
					description: brand.description,
					logoUrl: brand.logoUrl,
					websiteUrl: brand.websiteUrl,
					isActive: brand.isActive,
					createdAt: brand.createdAt,
					updatedAt: brand.updatedAt
				}
			);
		}

		if (operations.length > 0) {
			await this.es.bulk({ operations });
			this.logger.log(`Synced ${brands.length} brands to Elasticsearch`);
		}
	}

	/**
	 * Sync shops to Elasticsearch
	 */
	private async syncShopsToES(): Promise<void> {
		this.logger.log('Syncing shops to Elasticsearch...');

		const shops = await this.prismaService.shop.findMany({
			orderBy: { createdAt: 'asc' }
		});

		const operations: any[] = [];
		for (const shop of shops) {
			operations.push(
				{ index: { _index: 'shops', _id: shop.id } },
				{
					id: shop.id,
					name: shop.name,
					slug: shop.slug,
					description: shop.description,
					logoUrl: shop.logoUrl,
					bannerUrl: shop.bannerUrl,
					email: shop.email,
					phone: shop.phone,
					address: shop.address,
					website: shop.website,
					status: shop.status,
					isActive: shop.isActive,
					isVerified: shop.isVerified,
					rating: shop.rating,
					totalReviews: shop.totalReviews,
					ownerId: shop.ownerId,
					createdAt: shop.createdAt,
					updatedAt: shop.updatedAt
				}
			);
		}

		if (operations.length > 0) {
			await this.es.bulk({ operations });
			this.logger.log(`Synced ${shops.length} shops to Elasticsearch`);
		}
	}

	/**
	 * Sync products (SPUs and SKUs) to Elasticsearch using existing service methods
	 */
	private async syncProductsToES(): Promise<void> {
		this.logger.log('Syncing products to Elasticsearch...');

		const spus = await this.prismaService.spu.findMany({
			select: { id: true },
			orderBy: { createdAt: 'asc' }
		});

		let syncedCount = 0;
		const batchSize = 10;

		for (let i = 0; i < spus.length; i += batchSize) {
			const batch = spus.slice(i, i + batchSize);

			await Promise.all(
				batch.map(async (spu) => {
					try {
						await this.elasticsearchService.indexSpu(spu.id);
						syncedCount++;
					} catch (error) {
						this.logger.error(`Failed to sync SPU ${spu.id}:`, error);
					}
				})
			);

			// Add a small delay between batches to avoid overwhelming Elasticsearch
			if (i + batchSize < spus.length) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

		this.logger.log(`Synced ${syncedCount}/${spus.length} products to Elasticsearch`);
	}

	/**
	 * Sync users to Elasticsearch (basic info only, no sensitive data)
	 */
	private async syncUsersToES(): Promise<void> {
		this.logger.log('Syncing users to Elasticsearch...');

		const users = await this.prismaService.user.findMany({
			select: {
				id: true,
				fullname: true,
				username: true,
				email: true,
				city: true,
				state: true,
				isVerified: true,
				status: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: { createdAt: 'asc' }
		});

		const operations: any[] = [];
		for (const user of users) {
			operations.push(
				{ index: { _index: 'users', _id: user.id } },
				{
					id: user.id,
					fullname: user.fullname,
					username: user.username,
					email: user.email,
					city: user.city,
					state: user.state,
					isVerified: user.isVerified,
					status: user.status,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				}
			);
		}

		if (operations.length > 0) {
			await this.es.bulk({ operations });
			this.logger.log(`Synced ${users.length} users to Elasticsearch`);
		}
	}

	/**
	 * Clear all Elasticsearch indices
	 */
	async clearElasticsearchData(): Promise<void> {
		const indices = ['spus', 'skus', 'categories', 'brands', 'shops', 'users'];

		for (const index of indices) {
			try {
				const exists = await this.es.indices.exists({ index });
				if (exists) {
					await this.es.indices.delete({ index });
					this.logger.log(`Deleted Elasticsearch index: ${index}`);
				}
			} catch (error) {
				this.logger.error(`Failed to delete index ${index}:`, error);
			}
		}
	}
}