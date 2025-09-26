import { Body, Controller, Post, Query, Req } from "@nestjs/common";
import express from 'express'
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentService } from "./comment.service";
@Controller('comment')
export class CommentController {

	constructor(
		private readonly commentService: CommentService
	) { }

	@Post('create-comment')
	async createComment(@Req() req: express.Request, @Query('skuId') skuId: string, @Body() dto: CreateCommentDto) {
		return this.commentService.createComment(req, skuId, dto)
	}
}