import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import express from 'express'
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiResponse, ApiBadRequestResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateSpuDto } from "./dto/create-spu.dto";
import { ProductService } from "./product.service";
import { Roles } from "@/common/decorator/role.decorator";
import { RoleId } from "@/common/enum/role.enum";
import { UpdateSpuDto } from "./dto/update-spu.dto";
import { IsAuthorProductGuard } from "./guard/IsAuthorProduct.guard";
import { Public } from "@/common/decorator/public.decorator";
import { OrderProductDto } from "./dto/order-product.dto";


@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {

	constructor(
		private readonly productService: ProductService
	) { }
	@Roles(RoleId.ADMIN.toString(), RoleId.SELLER.toString())
	@Post('add-spu')
	@ApiOperation({ summary: 'Create a new SPU (product)' })
	@ApiCreatedResponse({ description: 'SPU successfully created' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: CreateSpuDto })
	async addSpu(@Req() req: express.Request, @Body() dto: CreateSpuDto) {
		return this.productService.createSpu(req, dto)
	}
	@Roles(RoleId.ADMIN.toString(), RoleId.SELLER.toString())
	@Put('update-spu')
	@UseGuards(IsAuthorProductGuard)
	@ApiOperation({ summary: 'Update an existing SPU (product)' })
	@ApiResponse({ status: 200, description: 'SPU updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: UpdateSpuDto })
	async updateSpu(@Query('productId') productId: string, @Body() dto: UpdateSpuDto) {
		return this.productService.updateSpu(productId, dto)
	}
	@Roles(RoleId.ADMIN.toString(), RoleId.SELLER.toString())
	@Delete('delete-spu')
	@UseGuards(IsAuthorProductGuard)
	@ApiOperation({ summary: 'Delete an existing SPU (product)' })
	@ApiResponse({ status: 200, description: 'SPU deleted successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiResponse({ status: 403, description: 'Forbidden resource' })
	async deleteSpu(@Query('productId') productId: string) {
		return this.productService.deleteSpu(productId)
	}

	@Get('search')
	@Public()
	@ApiOperation({ summary: 'Search products using Elasticsearch' })
	@ApiResponse({ status: 200, description: 'Search results returned successfully' })
	async searchProducts(
		@Query('q') query?: string,
		@Query('categoryId') categoryId?: string,
		@Query('brandId') brandId?: string,
		@Query('hasStock') hasStock?: boolean,
		@Query('minPrice') minPrice?: number,
		@Query('maxPrice') maxPrice?: number,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 20
	) {
		return this.productService.searchProducts(query, {
			categoryId,
			brandId,
			hasStock,
			priceRange: (minPrice !== undefined && maxPrice !== undefined) ? { min: minPrice, max: maxPrice } : undefined,
			page,
			limit
		})
	}

	@Get('categories')
	@Public()
	@ApiOperation({ summary: 'Get all product categories' })
	async getCategories() {
		return this.productService.getCategories()
	}

	@Get('brands')
	@Public()
	@ApiOperation({ summary: 'Get all product brands' })
	async getBrands() {
		return this.productService.getBrands()
	}

	@Post('order')
	@ApiOperation({ summary: 'Place an order for a product' })
	@ApiResponse({ status: 201, description: 'Order placed successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: OrderProductDto })
	async orderProduct(@Req() req: express.Request, @Body() dto: OrderProductDto) {
		return this.productService.orderProduct(req, dto);
	}

	@Post('cancel-order')
	@ApiOperation({ summary: 'Cancel an existing order' })
	@ApiResponse({ status: 200, description: 'Order canceled successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async cancelOrder(@Req() req: express.Request, @Query('orderProductId') orderProductId: string) {
		return this.productService.cancelOrder(req, orderProductId);
	}
}