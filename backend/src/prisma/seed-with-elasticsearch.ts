#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
	const logger = new Logger('SeedScript');

	try {
		logger.log('🚀 Starting application for seeding...');
		const app = await NestFactory.create(AppModule, { logger: false });

		const prismaService = app.get(PrismaService);

		logger.log('🌱 Starting enhanced seed with Elasticsearch sync via events...');

		// Run seed with automatic Elasticsearch sync via events
		await prismaService.seedWithElasticsearchSync();

		logger.log('✅ Seeding with Elasticsearch sync completed successfully!');

		await app.close();
	} catch (error) {
		logger.error('❌ Seeding failed:', error);
		process.exit(1);
	}
}

// Only run if this file is executed directly
if (require.main === module) {
	bootstrap().catch((error) => {
		console.error('Failed to run seed script:', error);
		process.exit(1);
	});
}

export { bootstrap };