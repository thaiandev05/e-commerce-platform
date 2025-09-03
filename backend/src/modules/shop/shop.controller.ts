import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ShopService } from './services/shop.service';
import express from 'express';
import { CreateShopDto } from './dto/create-shop.dto';
import { IsAuthorShopGuard } from './guard/isAuthorShop.guard';
import { Public } from '@/common/decorator/public.decorator';
import { UpdateShopDto } from './dto/update-shop.dto';
@Controller('shop')
export class ShopController {
	constructor(
		private readonly shopService: ShopService
	) { }

	// create shop
	@Post('create-shop')
	async createShop(@Req() req: express.Request, @Body() dto: CreateShopDto) {
		return this.shopService.createShop(req, dto)
	}

	// verify shop
	@Public()
	@Get('verify-shop-link')
	async verifyLink(@Res() res: express.Response, @Query('email') email: string, @Query('shopId') shopId: string) {
		return this.shopService.verifyShopLink(shopId, email, res)
	}

	@Patch('verify-shop')
	@UseGuards(IsAuthorShopGuard)
	async verifyShop(@Req() req: express.Request, @Query('shopId') shopId: string) {
		return this.shopService.verifyShop(req, shopId)
	}

	@Put('update-detail-shop')
	@UseGuards(IsAuthorShopGuard)
	async updateShop(@Req() req: express.Request, @Query('shopId') shopId: string, @Body() dto: UpdateShopDto) {
		return this.shopService.updateDetailShop(req, shopId, dto)
	}

	@Delete('delete-shop')
	@UseGuards(IsAuthorShopGuard)
	async deleteShop(@Req() req: express.Request, @Query('shopId') shopId: string) {
		return this.shopService.deleteShop(req, shopId)
	}


}	
