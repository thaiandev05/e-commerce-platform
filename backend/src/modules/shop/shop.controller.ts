import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ShopService } from './services/shop.service';
import express from 'express';
import { CreateShopDto } from './dto/create-shop.dto';
import { IsAuthorShopGuard } from './guard/isAuthorShop.guard';
import { Public } from '@/common/decorator/public.decorator';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopDetailWithSpusDto } from './dto/get-shop-detail-with-spus.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
	constructor(
		private readonly shopService: ShopService
	) { }

	// create shop
	@Post('create-shop')
	@ApiOperation({ summary: 'Create a new shop' })
	@ApiCreatedResponse({ description: 'Shop successfully created' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: CreateShopDto })
	async createShop(@Req() req: express.Request, @Body() dto: CreateShopDto) {
		return this.shopService.createShop(req, dto)
	}

	// verify shop
	@Public()
	@Get('verify-shop-link')
	@ApiOperation({ summary: 'Verify shop using link sent to email' })
	@ApiResponse({ status: 302, description: 'Redirect or link processed' })
	@ApiBadRequestResponse({ description: 'Invalid verification link' })
	async verifyLink(@Res() res: express.Response, @Query('email') email: string, @Query('shopId') shopId: string) {
		return this.shopService.verifyShopLink(shopId, email, res)
	}

	@Patch('verify-shop')
	@UseGuards(IsAuthorShopGuard)
	@ApiOperation({ summary: 'Verify shop (authenticated author)' })
	@ApiResponse({ status: 200, description: 'Shop verified' })
	@ApiBadRequestResponse({ description: 'Invalid request or permission' })
	async verifyShop(@Req() req: express.Request, @Query('shopId') shopId: string) {
		return this.shopService.verifyShop(req, shopId)
	}

	@Put('update-detail-shop')
	@UseGuards(IsAuthorShopGuard)
	@ApiOperation({ summary: 'Update shop details' })
	@ApiResponse({ status: 200, description: 'Shop updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input or permission' })
	@ApiBody({ type: UpdateShopDto })
	async updateShop(@Req() req: express.Request, @Query('shopId') shopId: string, @Body() dto: UpdateShopDto) {
		return this.shopService.updateDetailShop(req, shopId, dto)
	}

	@Delete('delete-shop')
	@UseGuards(IsAuthorShopGuard)
	@ApiOperation({ summary: 'Delete a shop' })
	@ApiResponse({ status: 200, description: 'Shop deleted successfully' })
	@ApiBadRequestResponse({ description: 'Invalid request or permission' })
	async deleteShop(@Req() req: express.Request, @Query('shopId') shopId: string) {
		return this.shopService.deleteShop(req, shopId)
	}

	@Public()
	@Get('get-detail-shop')
	@ApiOperation({ summary: 'Get shop detail with SPUs' })
	@ApiResponse({ status: 200, description: 'Shop detail retrieved' })
	@ApiBadRequestResponse({ description: 'Invalid request' })
	async getDetailShop(@Query('shopId') shopId: string, @Query() dto: GetShopDetailWithSpusDto) {
		return this.shopService.getDetailerShop(shopId, dto)
	}


}
