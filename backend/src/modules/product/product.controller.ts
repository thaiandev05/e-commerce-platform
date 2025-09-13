import { Body, Controller, Delete, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import express from 'express'
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiResponse, ApiBadRequestResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateSpuDto } from "./dto/create-spu.dto";
import { ProductService } from "./product.service";
import { Roles } from "@/common/decorator/role.decorator";
import { RoleId } from "@/common/enum/role.enum";
import { UpdateSpuDto } from "./dto/update-spu.dto";
import { IsAuthorProductGuard } from "./guard/IsAuthorProduct.guard";

@Roles(RoleId.ADMIN.toString(), RoleId.SELLER.toString())
@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {

	constructor(
		private readonly productService: ProductService
	) { }

	@Post('add-spu')
	@ApiOperation({ summary: 'Create a new SPU (product)' })
	@ApiCreatedResponse({ description: 'SPU successfully created' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: CreateSpuDto })
	async addSpu(@Req() req: express.Request, @Body() dto: CreateSpuDto) {
		return this.productService.createSpu(req, dto)
	}

	@Put('update-spu')
	@UseGuards(IsAuthorProductGuard)
	@ApiOperation({ summary: 'Update an existing SPU (product)' })
	@ApiResponse({ status: 200, description: 'SPU updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: UpdateSpuDto })
	async updateSpu(@Req() req: express.Request, @Query('productId') productId: string, @Body() dto: UpdateSpuDto) {
		return this.productService.updateSpu(req, productId, dto)
	}

	@Delete('delete-spu')
	@UseGuards(IsAuthorProductGuard)
	@ApiOperation({ summary: 'Delete an existing SPU (product)' })
	@ApiResponse({ status: 200, description: 'SPU deleted successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiResponse({ status: 403, description: 'Forbidden resource' })
	async deleteSpu(@Req() req: express.Request, @Query('productId') productId: string) {
		return this.productService.deleteSpu(req, productId)
	}

}