import { ProductService } from '@/modules/product/service/product.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  private readonly Tracking = [
    {
      type: 'Tracking' as const,
      title: 'Kiểm tra yêu cầu hủy đơn hàng',
      payload: 'cancel_order',
    },
    {
      type: 'Tracking' as const,
      title: 'Thông tin đơn hàng',
      payload: 'warranty_privacy',
    },
  ];

  async handleTracking(payload: string, orderId: string, userId: string) {
    switch (payload) {
      case 'warranty_privacy':
        return await this.productService.getOrder(userId, orderId);
      case 'cancel_order':
        const statusOrder = await this.productService.getOrder(userId, orderId);
        console.log(statusOrder);
        return statusOrder.statusOrder === 'CANCEL' ? true : false;
    }
  }
}
