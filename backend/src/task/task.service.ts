import { ElasticsearchServiceCustom } from '@/modules/elasticsearch/elasticsearch.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
const TIME_OUT_DELETE = 15 * 24 * 60 * 60
@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name)
	private readonly redis = new Redis()
	constructor(
		private readonly prismaService: PrismaService,
		private readonly elasticSearchCustomService: ElasticsearchServiceCustom
	) { }

	@Cron('0 0 0 * * *')
	async handleCron() {
		await this.prismaService.user.deleteMany({
			where: {
				updatedAt: {
					lt: new Date(Date.now() - TIME_OUT_DELETE * 1000), 
				},
				status: 'SOFTDELETE',
			},
		});
		this.logger.log('Deleted expired accounts');

		let cursor = '0';
		do {
			const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', 'access:*', 'COUNT', 100);
			cursor = nextCursor;

			if (keys.length > 0) {
				const pipeline = this.redis.pipeline();
				const counts = await this.redis.mget(...keys);

				keys.forEach((key, idx) => {
					const count = Number(counts[idx] || 0);
					if (count >= 1000) {
						pipeline.incrby(key, 10); 
						this.logger.log(`Incremented ${key} by 10`);
					}
				});

				await pipeline.exec();
			}
		} while (cursor !== '0');

		this.logger.log('Redis access increment job done');
	}



}
