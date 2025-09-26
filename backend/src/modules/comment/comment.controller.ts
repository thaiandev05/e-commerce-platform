import { Body, Controller, Delete, Patch, Post, Query, Req } from "@nestjs/common";
import express from 'express'
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentService } from "./comment.service";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { DeleteCommentDto } from "./dto/delete-comment.dto";
@Controller('comment')
export class CommentController {

	constructor(
		private readonly commentService: CommentService
	) { }

	@Post('create-comment')
	async createComment(@Req() req: express.Request, @Query('skuId') skuId: string, @Body() dto: CreateCommentDto) {
		return this.commentService.createComment(req, skuId, dto)
	}

	@Patch('update-comment')
	async updateComment(@Req() req: express.Request, @Query('commentId') commentId: string, @Body() dto: UpdateCommentDto) {
		return this.commentService.updateComment(req, commentId, dto)
	}

	@Delete('delete-comment')
	async deleteComment(@Req() req: express.Request, @Query('commentId') commentId: string, @Body() dto: DeleteCommentDto) {
		return this.commentService.deleteComment(req, commentId, dto)
	}
}