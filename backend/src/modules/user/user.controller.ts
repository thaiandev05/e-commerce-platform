import { Body, Controller, Patch, Put, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./service/user.service";
import express from 'express';
import { changeDetailUserDto } from "./dto/change-detail.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ChangeAvataUrlDto } from "./dto/change-avataUrl.dto";
import { IsAuthorAccount } from "./guard/IsAuthorAccount.guard";

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserConctroller {
	constructor(
		private readonly userService: UserService
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
		return await this.userService.changeDetailUser(req, accountId, dto)
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
		return await this.userService.changeAvataUrl(req, accountId, dto)
	}
}