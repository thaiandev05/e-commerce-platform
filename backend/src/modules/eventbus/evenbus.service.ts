import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventBustService {
  private readonly logger = new Logger(EventBustService.name);

  constructor(private readonly emitter: EventEmitter2) {}

  emit(event: string, payload: any) {
    this.logger.debug(`Emitting event: ${event}`, payload);
    return this.emitter.emit(event, payload);
  }

  on(event: string, handler: (...args: any[]) => void): this {
    this.logger.debug(`Registering handler for event: ${event}`);
    this.emitter.on(event, handler);
    return this;
  }

  off(event: string, handler: (...args: any[]) => void): this {
    this.emitter.off(event, handler);
    return this;
  }

  once(event: string, handler: (...args: any[]) => void): this {
    this.emitter.once(event, handler);
    return this;
  }

  // Product specific events
  emitProductCreated(req: any, spu: any) {
    return this.emit('product.created', { req, newSpu: spu });
  }

  emitProductUpdated(spu: any) {
    return this.emit('product.updated', spu);
  }

  emitProductDeleted(productId: string) {
    return this.emit('product.deleted', { productId });
  }

  // Category events
  emitCategoryUpdated(category: any) {
    return this.emit('category.updated', category);
  }

  // Brand events
  emitBrandUpdated(brand: any) {
    return this.emit('brand.updated', brand);
  }

  // Inventory events
  emitInventoryUpdated(skuId: string, oldStock: number, newStock: number) {
    return this.emit('inventory.updated', { skuId, oldStock, newStock });
  }

  // Bulk operations
  emitBulkSync() {
    return this.emit('bulk.sync.requested', {});
  }
}
