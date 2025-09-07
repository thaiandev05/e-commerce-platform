import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
const TIME_OUT_DELETE = 15 * 24 * 60 * 60
@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name)

	constructor(
		private readonly prismaService: PrismaService
	) { }

	@Cron('0 0 0 * * *')
	async handleCron() {
		// delete account when expired time
		await this.prismaService.user.deleteMany({
			where: {
				updatedAt: {
					lt: String(TIME_OUT_DELETE),
				},
				status: 'SOFTDELETE'
			}
		})
		return this.logger.log("Delete many account expired time to recovery")
	}
}
