import { PrismaClient } from '../../prisma/generated/prisma';
import { Client } from '@elastic/elasticsearch';

async function syncDataToElasticsearch() {
	console.log('🚀 Bắt đầu sync dữ liệu từ PostgreSQL sang Elasticsearch...');

	// Khởi tạo Prisma client
	const prisma = new PrismaClient();

	// Khởi tạo Elasticsearch client
	const esClient = new Client({
		node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
	});

	try {
		// Kết nối database
		await prisma.$connect();
		console.log('✅ Kết nối PostgreSQL thành công');

		// Kiểm tra kết nối Elasticsearch
		await esClient.ping();
		console.log('✅ Kết nối Elasticsearch thành công');

		// 1. Sync Categories
		console.log('📂 Đang sync Categories...');
		const categories = await prisma.category.findMany({
			where: { isActive: true }
		});

		if (categories.length > 0) {
			const body = categories.flatMap(doc => [
				{ index: { _index: 'categories', _id: doc.id } },
				{
					id: doc.id,
					name: doc.name,
					slug: doc.slug,
					description: doc.description,
					imageUrl: doc.imageUrl,
					isActive: doc.isActive,
					sortOrder: doc.sortOrder,
					parentId: doc.parentId,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt
				}
			]);

			await esClient.bulk({ body });
			console.log(`✅ Đã sync ${categories.length} categories`);
		}

		// 2. Sync Brands
		console.log('🏷️  Đang sync Brands...');
		const brands = await prisma.brand.findMany({
			where: { isActive: true }
		});

		if (brands.length > 0) {
			const body = brands.flatMap(doc => [
				{ index: { _index: 'brands', _id: doc.id } },
				{
					id: doc.id,
					name: doc.name,
					slug: doc.slug,
					description: doc.description,
					logoUrl: doc.logoUrl,
					isActive: doc.isActive,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt
				}
			]);

			await esClient.bulk({ body });
			console.log(`✅ Đã sync ${brands.length} brands`);
		}

		// 3. Sync Shops
		console.log('🏪 Đang sync Shops...');
		const shops = await prisma.shop.findMany({
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
			const body = shops.flatMap(doc => [
				{ index: { _index: 'shops', _id: doc.id } },
				{
					id: doc.id,
					name: doc.name,
					slug: doc.slug,
					description: doc.description,
					logoUrl: doc.logoUrl,
					bannerUrl: doc.bannerUrl,
					email: doc.email,
					phone: doc.phone,
					address: doc.address,
					website: doc.website,
					status: doc.status,
					isActive: doc.isActive,
					isVerified: doc.isVerified,
					rating: doc.rating,
					totalReviews: doc.totalReviews,
					ownerId: doc.ownerId,
					ownerName: doc.owner?.fullname,
					ownerEmail: doc.owner?.email,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt
				}
			]);

			await esClient.bulk({ body });
			console.log(`✅ Đã sync ${shops.length} shops`);
		}

		// 4. Sync SPUs (Products)
		console.log('📦 Đang sync SPUs (Products)...');
		const spus = await prisma.spu.findMany({
			where: { isActive: true },
			include: {
				category: true,
				brand: true,
				shop: {
					select: {
						id: true,
						name: true,
						isActive: true
					}
				},
				skus: {
					where: { isActive: true }
				}
			}
		});

		if (spus.length > 0) {
			const body = spus.flatMap(doc => {
				const prices = doc.skus.map(sku => Number(sku.salePrice || sku.originalPrice));
				const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
				const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
				const totalStock = doc.skus.reduce((sum, sku) => sum + sku.stock, 0);

				return [
					{ index: { _index: 'spus', _id: doc.id } },
					{
						id: doc.id,
						name: doc.name,
						slug: doc.slug,
						description: doc.description,
						status: doc.status,
						isActive: doc.isActive,
						categoryId: doc.categoryId,
						categoryName: doc.category?.name,
						brandId: doc.brandId,
						brandName: doc.brand?.name,
						shopId: doc.shopId,
						shopName: doc.shop?.name,
						minPrice: minPrice,
						maxPrice: maxPrice,
						hasStock: totalStock > 0,
						totalStock: totalStock,
						skuCount: doc.skus.length,
						searchKeywords: `${doc.name} ${doc.description || ''} ${doc.category?.name || ''} ${doc.brand?.name || ''}`.toLowerCase(),
						createdAt: doc.createdAt,
						updatedAt: doc.updatedAt
					}
				];
			});

			await esClient.bulk({ body });
			console.log(`✅ Đã sync ${spus.length} SPUs`);
		}

		// 5. Sync SKUs
		console.log('🔖 Đang sync SKUs...');
		const skus = await prisma.sku.findMany({
			where: { isActive: true },
			include: {
				spu: {
					include: {
						category: true,
						brand: true,
						shop: {
							select: {
								id: true,
								name: true,
								isActive: true
							}
						}
					}
				}
			}
		});

		if (skus.length > 0) {
			const body = skus.flatMap(doc => [
				{ index: { _index: 'skus', _id: doc.id } },
				{
					id: doc.id,
					spuId: doc.spuId,
					originalPrice: Number(doc.originalPrice),
					salePrice: Number(doc.salePrice || doc.originalPrice),
					stock: doc.stock,
					isActive: doc.isActive,
					spuName: doc.spu?.name,
					spuSlug: doc.spu?.slug,
					categoryId: doc.spu?.categoryId,
					categoryName: doc.spu?.category?.name,
					brandId: doc.spu?.brandId,
					brandName: doc.spu?.brand?.name,
					shopId: doc.spu?.shopId,
					shopName: doc.spu?.shop?.name,
					hasStock: doc.stock > 0,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt
				}
			]);

			await esClient.bulk({ body });
			console.log(`✅ Đã sync ${skus.length} SKUs`);
		}

		// 6. Verify indices
		console.log('🔍 Đang kiểm tra các indices trong Elasticsearch...');

		const indices = ['categories', 'brands', 'shops', 'spus', 'skus'];
		for (const index of indices) {
			try {
				const result = await esClient.count({ index });
				console.log(`📊 Index "${index}": ${result.count} documents`);
			} catch (error) {
				console.warn(`⚠️  Không thể đếm documents trong index "${index}": ${error.message}`);
			}
		}

		console.log('🎉 Hoàn thành sync dữ liệu thành công!');

	} catch (error) {
		console.error('❌ Lỗi khi sync dữ liệu:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Chạy sync
syncDataToElasticsearch();