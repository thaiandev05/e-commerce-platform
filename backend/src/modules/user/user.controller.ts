import { Body, Controller, Get, Patch, Put, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./service/user.service";
import express from 'express';
import { changeDetailUserDto } from "./dto/change-detail.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ChangeAvataUrlDto } from "./dto/change-avataUrl.dto";
import { IsAuthorAccount } from "./guard/IsAuthorAccount.guard";
import { AddCreditCardDto } from "./dto/add-credit-card.dto";
import { Public } from "@/common/decorator/public.decorator";
import { SearchUserLikeNameDto } from "./dto/search-user-like-name.dto";
import { UserSearchService } from "./service/user.search.service";

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserConctroller {
	constructor(
		private readonly userService: UserService,
		private readonly userSearchService: UserSearchService
	) { }

	@Put('change-detail')
	@UseGuards(IsAuthorAccount)
	@ApiOperation({ summary: 'Change current user details' })
	@ApiQuery({ name: 'accountId', required: false, description: 'Account id (optional)' })
	@ApiBody({ type: changeDetailUserDto })
	@ApiResponse({ status: 200, description: 'User details updated.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async changeDetail(@Req() req: express.Request, @Query('accountId') accountId: string, @Body() dto: changeDetailUserDto) {
		return this.userService.changeDetailUser(req, accountId, dto)
	}

	@Patch('change-avataUrl')
	@UseGuards(IsAuthorAccount)
	@ApiOperation({ summary: 'Change user avatar URL' })
	@ApiQuery({ name: 'accountId', required: false, description: 'Account id (optional)' })
	@ApiBody({ type: ChangeAvataUrlDto })
	@ApiResponse({ status: 200, description: 'Avatar updated.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async changeAvataUrl(@Req() req: express.Request, @Query('accountId') accountId: string, @Body() dto: ChangeAvataUrlDto) {
		return this.userService.changeAvataUrl(req, accountId, dto)
	}

	@Patch('add-credit-card')
	@UseGuards(IsAuthorAccount)
	@ApiOperation({ summary: 'Add a credit card to user account' })
	@ApiQuery({ name: 'accountId', required: false, description: 'Account id (optional)' })
	@ApiBody({ type: AddCreditCardDto })
	@ApiResponse({ status: 200, description: 'Credit card added.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async addCreditCard(@Req() req: express.Request, @Query('accountId') accountId: string, @Body() dto: AddCreditCardDto) {
		return this.userService.addCreditCard(req, accountId, dto)
	}

	@Public()
	@Get('search-account-like-name')
	@ApiOperation({ summary: 'Search accounts by name (username or fullname)' })
	@ApiQuery({ name: 'name', required: false, description: 'Search term for username or fullname' })
	@ApiBody({ type: SearchUserLikeNameDto })
	@ApiResponse({ status: 200, description: 'Search results returned.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async searchAccountLikeName(@Query('name') name: string, @Body() dto: SearchUserLikeNameDto) {
		return this.userSearchService.searchUserLikeName(name, dto)
	}
}