import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { Spu } from "@prisma/generated/prisma";

@Injectable()
export class EventConsumer {
	private readonly logger = new Logger(EventConsumer.name);

	@OnEvent('product.created')
	async handleProductCreated(payload: { req: any; newSpu: Spu }) {
		this.logger.log(`Product created event received: ${payload.newSpu.id}`);
		// Additional logic can be added here (notifications, analytics, etc.)
	}

	@OnEvent('product.updated')
	async handleProductUpdated(spu: Spu) {
		this.logger.log(`Product updated event received: ${spu.id}`);
		// Additional logic can be added here (notifications, cache invalidation, etc.)
	}

	@OnEvent('product.deleted')
	async handleProductDeleted(payload: { productId: string }) {
		this.logger.log(`Product deleted event received: ${payload.productId}`);
		// Additional logic can be added here (cleanup, notifications, etc.)
	}

	@OnEvent('category.updated')
	async handleCategoryUpdated(payload: any) {
		this.logger.log(`Category updated event received: ${payload.id}`);
		// Could trigger re-indexing of all products in this category
	}

	@OnEvent('brand.updated')
	async handleBrandUpdated(payload: any) {
		this.logger.log(`Brand updated event received: ${payload.id}`);
		// Could trigger re-indexing of all products for this brand
	}

	@OnEvent('inventory.updated')
	async handleInventoryUpdated(payload: { skuId: string; oldStock: number; newStock: number }) {
		this.logger.log(`Inventory updated for SKU: ${payload.skuId}`);
		// Could update stock levels in search index
	}
}