import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchServiceCustom } from '../modules/elasticsearch/elasticsearch.service';
import { Logger } from '@nestjs/common';

async function syncDataToElasticsearch() {
	const logger = new Logger('ElasticsearchSync');

	try {
		// Tạo NestJS application context
		const app = await NestFactory.createApplicationContext(AppModule);

		// Lấy services
		const prismaService = app.get(PrismaService);
		const elasticsearchService = app.get(ElasticsearchServiceCustom);

		logger.log('🚀 Bắt đầu sync dữ liệu từ PostgreSQL sang Elasticsearch...');

		// 1. Sync Categories
		logger.log('📂 Đang sync Categories...');
		const categories = await prismaService.category.findMany({
			where: { isActive: true }
		});

		if (categories.length > 0) {
			for (const category of categories) {
				await elasticsearchService.indexCategory(category);
			}
			logger.log(`✅ Đã sync ${categories.length} categories`);
		}

		// 2. Sync Brands
		logger.log('🏷️  Đang sync Brands...');
		const brands = await prismaService.brand.findMany({
			where: { isActive: true }
		});

		if (brands.length > 0) {
			for (const brand of brands) {
				await elasticsearchService.indexBrand(brand);
			}
			logger.log(`✅ Đã sync ${brands.length} brands`);
		}

		// 3. Sync Shops
		logger.log('🏪 Đang sync Shops...');
		const shops = await prismaService.shop.findMany({
			where: { isActive: true },
			include: {
				owner: {
					select: {
						fullname: true,
						email: true
					}
				}
			}
		});

		if (shops.length > 0) {
			for (const shop of shops) {
				await elasticsearchService.indexShop(shop);
			}
			logger.log(`✅ Đã sync ${shops.length} shops`);
		}

		// 4. Sync SPUs (Products)
		logger.log('📦 Đang sync SPUs (Products)...');
		const spus = await prismaService.spu.findMany({
			where: { isActive: true },
			select: { id: true }
		});

		if (spus.length > 0) {
			for (const spu of spus) {
				await elasticsearchService.indexSpu(spu.id);
			}
			logger.log(`✅ Đã sync ${spus.length} SPUs`);
		}

		// 5. Sync SKUs
		logger.log('🔖 Đang sync SKUs...');
		const skus = await prismaService.sku.findMany({
			where: { isActive: true },
			select: { id: true }
		});

		if (skus.length > 0) {
			for (const sku of skus) {
				await elasticsearchService.indexSku(sku.id);
			}
			logger.log(`✅ Đã sync ${skus.length} SKUs`);
		}

		logger.log('🎉 Hoàn thành sync dữ liệu thành công!');

		// Đóng kết nối
		await app.close();
		process.exit(0);

	} catch (error) {
		logger.error('❌ Lỗi khi sync dữ liệu:', error);
		process.exit(1);
	}
}

// Chạy sync
syncDataToElasticsearch();