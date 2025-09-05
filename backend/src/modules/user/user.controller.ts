import { Body, Controller, Put, Query, Req } from "@nestjs/common";
import { UserService } from "./service/user.service";
import express from 'express';
import { changeDetailUserDto } from "./dto/change-detail.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserConctroller {
	constructor(
		private readonly userService: UserService
	) { }

	@Put('change-detail')
	@ApiOperation({ summary: 'Change current user details' })
	@ApiQuery({ name: 'accountId', required: false, description: 'Account id (optional)' })
	@ApiBody({ type: changeDetailUserDto })
	@ApiResponse({ status: 200, description: 'User details updated.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async changeDetail(@Req() req: express.Request, @Query('accountId') accountId: string, @Body() dto: changeDetailUserDto) {
		return await this.userService.changeDetailUser(req, accountId, dto)
	}
}