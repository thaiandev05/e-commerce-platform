import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TrackingService {
	constructor(
		private readonly prismaService: PrismaService,
	) { }

	private readonly Tracking = [
		{ type: 'Tracking' as const, title: 'Đơn hàng của tôi đã giao đến đâu?', payload: 'status_order' },
		{ type: 'Tracking' as const, title: 'Kiểm tra yêu cầu hủy đơn hàng', payload: 'cancel_order' },
		{ type: 'Tracking' as const, title: 'Thông tin đơn hàng', payload: 'warranty_privacy' }
	]

	handleTracking() {

	}
}