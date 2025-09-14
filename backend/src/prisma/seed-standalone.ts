#!/usr/bin/env ts-node
import { PrismaService } from './prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Logger } from '@nestjs/common';

// Mock Elasticsearch service for seeding
class MockElasticsearchService {
	private logger = new Logger('MockElasticsearch');

	indices = {
		exists: async (params: any) => {
			this.logger.log(`Checking if index ${params.index} exists`);
			return false; // Always return false to trigger creation
		},
		create: async (params: any) => {
			this.logger.log(`Creating index ${params.index}`);
			return { acknowledged: true };
		},
		delete: async (params: any) => {
			this.logger.log(`Deleting index ${params.index}`);
			return { acknowledged: true };
		}
	};

	async bulk(params: any) {
		this.logger.log(`Bulk indexing ${params.operations.length / 2} documents`);
		return { errors: false };
	}
}

// Mock Elasticsearch Custom Service
class MockElasticsearchServiceCustom {
	private logger = new Logger('MockElasticsearchCustom');

	async indexSpu(spuId: string) {
		this.logger.log(`Indexing SPU: ${spuId}`);
		return { result: 'created' };
	}
}

async function main() {
	const logger = new Logger('SeedWithElasticsearch');

	try {
		logger.log('🚀 Starting standalone seed with Elasticsearch simulation...');

		// Create services
		const eventEmitter = new EventEmitter2();
		const prismaService = new PrismaService(eventEmitter);

		// Initialize Prisma
		await prismaService.$connect();

		logger.log('🌱 Running comprehensive database seed...');

		// Run the seed
		await prismaService.seed();

		logger.log('🔍 Simulating Elasticsearch sync...');

		// Mock Elasticsearch sync
		const mockEs = new MockElasticsearchService();
		const mockEsCustom = new MockElasticsearchServiceCustom();

		// Simulate creating indices
		const indices = ['spus', 'skus', 'categories', 'brands', 'shops', 'users'];
		for (const index of indices) {
			await mockEs.indices.exists({ index });
			await mockEs.indices.create({ index });
		}

		// Simulate bulk operations
		const categories = await prismaService.category.findMany();
		logger.log(`📁 Mock syncing ${categories.length} categories to Elasticsearch`);
		await mockEs.bulk({
			operations: categories.flatMap(cat => [
				{ index: { _index: 'categories', _id: cat.id } },
				{ id: cat.id, name: cat.name, slug: cat.slug }
			])
		});

		const brands = await prismaService.brand.findMany();
		logger.log(`🏢 Mock syncing ${brands.length} brands to Elasticsearch`);
		await mockEs.bulk({
			operations: brands.flatMap(brand => [
				{ index: { _index: 'brands', _id: brand.id } },
				{ id: brand.id, name: brand.name, slug: brand.slug }
			])
		});

		const shops = await prismaService.shop.findMany();
		logger.log(`🏪 Mock syncing ${shops.length} shops to Elasticsearch`);
		await mockEs.bulk({
			operations: shops.flatMap(shop => [
				{ index: { _index: 'shops', _id: shop.id } },
				{ id: shop.id, name: shop.name, slug: shop.slug }
			])
		});

		const spus = await prismaService.spu.findMany();
		logger.log(`📦 Mock syncing ${spus.length} SPUs to Elasticsearch`);

		// Batch process SPUs
		const batchSize = 10;
		for (let i = 0; i < spus.length; i += batchSize) {
			const batch = spus.slice(i, i + batchSize);
			await Promise.all(
				batch.map(spu => mockEsCustom.indexSpu(spu.id))
			);

			if (i + batchSize < spus.length) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

		logger.log('✅ Standalone seed with Elasticsearch simulation completed successfully!');
		logger.log('🎯 Results:');
		logger.log(`  - ${categories.length} categories synced`);
		logger.log(`  - ${brands.length} brands synced`);
		logger.log(`  - ${shops.length} shops synced`);
		logger.log(`  - ${spus.length} products synced`);
		logger.log('');
		logger.log('💡 Note: This was a simulation. For real Elasticsearch sync:');
		logger.log('  1. Start the main application: pnpm start:dev');
		logger.log('  2. The EventEmitter system will handle real Elasticsearch sync');

		await prismaService.$disconnect();
		process.exit(0);

	} catch (error) {
		logger.error('❌ Standalone seeding failed:', error);
		process.exit(1);
	}
}

// Only run if this file is executed directly
if (require.main === module) {
	main();
}