import { Body, Controller, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import express from 'express';
import { CreateShopDto } from './dto/create-shop.dto';
import { IsAuthorShopGuard } from './guard/isAuthorShop.guard';
import { Public } from '@/common/decorator/public.decorator';
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
	async verifyLink(@Res() res: express.Response, @Query('shopId') shopId: string) {
		return this.shopService.verifyShopLink(shopId, res)
	}

	@Patch('verify-shop')
	@UseGuards(IsAuthorShopGuard)
	async verifyShop(@Req() req: express.Request, @Query('shopId') shopId: string) {
		return this.shopService.verifyShop(req, shopId)
	}
}	
