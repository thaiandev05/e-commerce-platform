import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PrismaClient } from '../../prisma/generated/prisma';
import { seedCollections, chunk } from './seed-data';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name);

	constructor(private readonly eventEmitter: EventEmitter2) {
		super({
			log: [
				{ emit: 'event', level: 'query' },
				{ emit: 'event', level: 'error' },
				{ emit: 'event', level: 'info' },
				{ emit: 'event', level: 'warn' }
			],
			omit: { user: { hashingPassword: true } }
		})
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}

	async seed() {
		console.log('🌱 Starting comprehensive database seeding...');

		try {
			// Clear existing data in correct order (respecting foreign key constraints)
			console.log('🗑️ Clearing existing data...');
			await this.clearExistingData();

			console.log('📊 Seed data statistics:');
			console.log(`- ${seedCollections.roles.length} roles`);
			console.log(`- ${seedCollections.permissions.length} permissions`);
			console.log(`- ${seedCollections.users.length} users`);
			console.log(`- ${seedCollections.userRoles.length} user-role assignments`);
			console.log(`- ${seedCollections.categories.length} categories`);
			console.log(`- ${seedCollections.brands.length} brands`);
			console.log(`- ${seedCollections.shops.length} shops`);
			console.log(`- ${seedCollections.spus.length} SPUs`);
			console.log(`- ${seedCollections.skus.length} SKUs`);

			// Seed core authentication and authorization data
			console.log('🔐 Seeding roles and permissions...');
			await this.role.createMany({ data: seedCollections.roles });
			await this.permission.createMany({ data: seedCollections.permissions });

			console.log('👥 Seeding users...');
			await this.user.createMany({ data: seedCollections.users });

			console.log('🔗 Seeding user roles...');
			await this.userRole.createMany({ data: seedCollections.userRoles });

			// Seed product catalog structure
			console.log('🏪 Seeding categories...');
			await this.category.createMany({ data: seedCollections.categories });

			console.log('🏢 Seeding brands...');
			await this.brand.createMany({ data: seedCollections.brands });

			console.log('🛍️ Seeding shops...');
			await this.shop.createMany({ data: seedCollections.shops });

			console.log('🏷️ Seeding tags...');
			await this.tag.createMany({ data: seedCollections.tags });

			console.log('🔧 Seeding attributes...');
			await this.attribute.createMany({ data: seedCollections.attributes });

			console.log('📋 Seeding attribute values...');
			await this.attributeValue.createMany({ data: seedCollections.attributeValues });

			// Seed products
			console.log('📦 Seeding SPUs...');
			await this.spu.createMany({ data: seedCollections.spus });

			console.log('📊 Seeding SKUs...');
			await this.sku.createMany({ data: seedCollections.skus });

			// Seed additional user data
			if (seedCollections.oauth2Users.length > 0) {
				console.log('🔗 Seeding OAuth2 users...');
				await this.oauth2User.createMany({ data: seedCollections.oauth2Users });
			}

			if (seedCollections.creditCards.length > 0) {
				console.log('💳 Seeding credit cards...');
				await this.creditCard.createMany({ data: seedCollections.creditCards });
			}

			if (seedCollections.sessions.length > 0) {
				console.log('📱 Seeding user sessions...');
				await this.session.createMany({ data: seedCollections.sessions });
			}

			if (seedCollections.codes.length > 0) {
				console.log('🔢 Seeding verification codes...');
				await this.code.createMany({ data: seedCollections.codes });
			}

			// Generate and seed images for products
			await this.seedProductImages();

			// Generate and seed product relationships
			await this.seedProductRelationships();

			console.log('✅ Database seeding completed successfully!');
			console.log('🎯 Key highlights:');
			console.log('  - Complete role-based access control system');
			console.log('  - Realistic Vietnamese product data');
			console.log('  - Proper user-shop relationships');
			console.log('  - Product variations and attributes');
			console.log('  - Authentication and payment data');

			// Emit events to sync data to Elasticsearch
			await this.syncDataToElasticsearchViaEvents();

		} catch (error) {
			console.error('❌ Error seeding database:', error);
			throw error;
		}
	}

	/**
	 * Clear existing data in the correct order
	 */
	private async clearExistingData(): Promise<void> {
		const operations = [
			// Clear product relationships first
			() => this.skuVariationValue.deleteMany(),
			() => this.spuVariation.deleteMany(),
			() => this.skuAttribute.deleteMany(),
			() => this.spuAttribute.deleteMany(),
			() => this.spuTag.deleteMany(),

			// Clear images
			() => this.skuImage.deleteMany(),
			() => this.spuImage.deleteMany(),

			// Clear products
			() => this.sku.deleteMany(),
			() => this.spu.deleteMany(),

			// Clear product metadata
			() => this.attributeValue.deleteMany(),
			() => this.attribute.deleteMany(),
			() => this.tag.deleteMany(),

			// Clear business entities
			() => this.shop.deleteMany(),
			() => this.brand.deleteMany(),
			() => this.category.deleteMany(),

			// Clear user data
			() => this.creditCard.deleteMany(),
			() => this.oauth2User.deleteMany(),
			() => this.session.deleteMany(),
			() => this.code.deleteMany(),

			// Clear auth relationships
			() => this.userRole.deleteMany(),
			() => this.rolePermission.deleteMany(),

			// Clear users and auth
			() => this.user.deleteMany(),
			() => this.role.deleteMany(),
			() => this.permission.deleteMany(),
		];

		for (const operation of operations) {
			try {
				await operation();
			} catch (error) {
				// Some operations may fail due to missing tables, that's ok
				this.logger.warn(`Clear operation failed (may be expected):`, error.message);
			}
		}
	}

	/**
	 * Seed product images
	 */
	private async seedProductImages(): Promise<void> {
		console.log('🖼️ Generating product images...');

		const spuImages: Prisma.SpuImageCreateManyInput[] = [];
		const skuImages: Prisma.SkuImageCreateManyInput[] = [];

		// Generate SPU images
		for (const spu of seedCollections.spus) {
			const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5 images per SPU
			for (let i = 0; i < imageCount; i++) {
				spuImages.push({
					id: crypto.randomUUID(),
					imageUrl: `https://picsum.photos/800/600?random=${Math.random()}`,
					altText: `${spu.name} - Hình ${i + 1}`,
					sortOrder: i,
					isMain: i === 0,
					spuId: spu.id!,
				});
			}
		}

		// Generate SKU images
		for (const sku of seedCollections.skus) {
			const imageCount = Math.floor(Math.random() * 2) + 1; // 1-2 images per SKU
			for (let i = 0; i < imageCount; i++) {
				skuImages.push({
					id: crypto.randomUUID(),
					imageUrl: `https://picsum.photos/600/600?random=${Math.random()}`,
					altText: `${sku.name} - Hình ${i + 1}`,
					sortOrder: i,
					isMain: i === 0,
					skuId: sku.id!,
				});
			}
		}

		// Insert images in chunks to avoid memory issues
		console.log(`📸 Seeding ${spuImages.length} SPU images...`);
		for (const imageChunk of chunk(spuImages, 500)) {
			await this.spuImage.createMany({ data: imageChunk });
		}

		console.log(`📸 Seeding ${skuImages.length} SKU images...`);
		for (const imageChunk of chunk(skuImages, 500)) {
			await this.skuImage.createMany({ data: imageChunk });
		}
	}

	/**
	 * Seed product relationships (attributes, tags, variations)
	 */
	private async seedProductRelationships(): Promise<void> {
		console.log('🔗 Creating product relationships...');

		const spuAttributes: Prisma.SpuAttributeCreateManyInput[] = [];
		const spuTags: Prisma.SpuTagCreateManyInput[] = [];
		const skuAttributes: Prisma.SkuAttributeCreateManyInput[] = [];

		// Create SPU-Attribute relationships
		for (const spu of seedCollections.spus.slice(0, 50)) { // Only for first 50 SPUs to avoid too much data
			// Random 1-3 attributes per SPU
			const numAttributes = Math.floor(Math.random() * 3) + 1;
			const usedAttributes = new Set();

			for (let i = 0; i < numAttributes; i++) {
				const attribute = seedCollections.attributes[Math.floor(Math.random() * seedCollections.attributes.length)];
				if (usedAttributes.has(attribute.id)) continue;
				usedAttributes.add(attribute.id);

				const availableValues = seedCollections.attributeValues.filter(av => av.attributeId === attribute.id);
				if (availableValues.length > 0) {
					const attributeValue = availableValues[Math.floor(Math.random() * availableValues.length)];

					spuAttributes.push({
						id: crypto.randomUUID(),
						spuId: spu.id!,
						attributeId: attribute.id!,
						attributeValueId: attributeValue.id!,
					});
				}
			}
		}

		// Create SPU-Tag relationships
		for (const spu of seedCollections.spus.slice(0, 80)) { // First 80 SPUs get tags
			// Random 1-4 tags per SPU
			const numTags = Math.floor(Math.random() * 4) + 1;
			const usedTags = new Set();

			for (let i = 0; i < numTags; i++) {
				const tag = seedCollections.tags[Math.floor(Math.random() * seedCollections.tags.length)];
				if (usedTags.has(tag.id)) continue;
				usedTags.add(tag.id);

				spuTags.push({
					id: crypto.randomUUID(),
					spuId: spu.id!,
					tagId: tag.id!,
				});
			}
		}

		// Create SKU-Attribute relationships (for variations)
		for (const sku of seedCollections.skus.slice(0, 100)) { // First 100 SKUs get attributes
			// Each SKU gets 1-2 variation attributes (like color, size)
			const variationAttributes = seedCollections.attributes.filter(attr => attr.isVariation);
			const numVariations = Math.min(2, variationAttributes.length);

			for (let i = 0; i < numVariations; i++) {
				const attribute = variationAttributes[i];
				const availableValues = seedCollections.attributeValues.filter(av => av.attributeId === attribute.id);

				if (availableValues.length > 0) {
					const attributeValue = availableValues[Math.floor(Math.random() * availableValues.length)];

					skuAttributes.push({
						id: crypto.randomUUID(),
						skuId: sku.id!,
						attributeId: attribute.id!,
						attributeValueId: attributeValue.id!,
					});
				}
			}
		}

		// Insert relationships in batches
		if (spuAttributes.length > 0) {
			console.log(`🏷️ Creating ${spuAttributes.length} SPU-attribute relationships...`);
			for (const batch of chunk(spuAttributes, 200)) {
				await this.spuAttribute.createMany({ data: batch });
			}
		}

		if (spuTags.length > 0) {
			console.log(`🏷️ Creating ${spuTags.length} SPU-tag relationships...`);
			for (const batch of chunk(spuTags, 200)) {
				await this.spuTag.createMany({ data: batch });
			}
		}

		if (skuAttributes.length > 0) {
			console.log(`🔧 Creating ${skuAttributes.length} SKU-attribute relationships...`);
			for (const batch of chunk(skuAttributes, 200)) {
				await this.skuAttribute.createMany({ data: batch });
			}
		}
	}

	/**
	 * Sync seeded data to Elasticsearch by emitting events
	 */
	private async syncDataToElasticsearchViaEvents(): Promise<void> {
		console.log('🔍 Starting Elasticsearch sync via events...');

		try {
			// Emit events for categories
			const categories = await this.category.findMany({
				select: { id: true },
				orderBy: { createdAt: 'asc' }
			});

			console.log(`📁 Emitting events for ${categories.length} categories...`);
			for (const category of categories) {
				const fullCategory = await this.category.findUnique({
					where: { id: category.id }
				});
				if (fullCategory) {
					this.eventEmitter.emit('category.created', fullCategory);
				}
			}

			// Emit events for brands
			const brands = await this.brand.findMany({
				select: { id: true },
				orderBy: { createdAt: 'asc' }
			});

			console.log(`🏢 Emitting events for ${brands.length} brands...`);
			for (const brand of brands) {
				const fullBrand = await this.brand.findUnique({
					where: { id: brand.id }
				});
				if (fullBrand) {
					this.eventEmitter.emit('brand.created', fullBrand);
				}
			}

			// Emit events for shops
			const shops = await this.shop.findMany({
				select: { id: true },
				orderBy: { createdAt: 'asc' }
			});

			console.log(`🏪 Emitting events for ${shops.length} shops...`);
			for (const shop of shops) {
				const fullShop = await this.shop.findUnique({
					where: { id: shop.id }
				});
				if (fullShop) {
					this.eventEmitter.emit('shop.created', fullShop);
				}
			}

			// Get all SPUs to emit product.created events
			const spus = await this.spu.findMany({
				select: { id: true },
				orderBy: { createdAt: 'asc' }
			});

			console.log(`📦 Emitting events for ${spus.length} products...`);

			// Emit events in batches to avoid overwhelming the system
			const batchSize = 10;
			let processedCount = 0;

			for (let i = 0; i < spus.length; i += batchSize) {
				const batch = spus.slice(i, i + batchSize);

				// Process batch in parallel
				await Promise.all(
					batch.map(async (spu) => {
						try {
							// Get full SPU data for the event
							const fullSpu = await this.spu.findUnique({
								where: { id: spu.id }
							});

							if (fullSpu) {
								// Emit the same event that ProductService uses
								this.eventEmitter.emit('product.created', {
									req: { user: { id: 'seed-system' } },
									newSpu: fullSpu
								});
								processedCount++;
							}
						} catch (error) {
							this.logger.error(`Failed to emit event for SPU ${spu.id}:`, error);
						}
					})
				);

				// Add small delay between batches
				if (i + batchSize < spus.length) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}

			console.log(`✅ Emitted events for ${processedCount}/${spus.length} products`);
			console.log('🎉 Elasticsearch sync via events completed!');

		} catch (error) {
			this.logger.error('Failed to sync data via events:', error);
			console.log('⚠️ Elasticsearch sync failed, but database seeding was successful');
		}
	}

	/**
	 * Seed with automatic Elasticsearch sync via events
	 */
	async seedWithElasticsearchSync(): Promise<void> {
		await this.seed();
	}
}