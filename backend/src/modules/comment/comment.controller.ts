import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import express from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@ApiTags('Comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create-comment')
  @ApiOperation({
    summary: 'Create a new comment',
    description: 'Creates a new comment for a specific SKU',
  })
  @ApiQuery({
    name: 'skuId',
    description: 'The SKU ID to comment on',
    type: 'string',
  })
  @ApiBody({ type: CreateCommentDto, description: 'Comment creation data' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async createComment(
    @Req() req: express.Request,
    @Query('skuId') skuId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createComment(req, skuId, dto);
  }

  @Patch('update-comment')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Updates an existing comment',
  })
  @ApiQuery({
    name: 'commentId',
    description: 'The ID of the comment to update',
    type: 'string',
  })
  @ApiBody({ type: UpdateCommentDto, description: 'Comment update data' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateComment(
    @Req() req: express.Request,
    @Query('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(req, commentId, dto);
  }

  @Delete('delete-comment')
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Deletes an existing comment',
  })
  @ApiQuery({
    name: 'commentId',
    description: 'The ID of the comment to delete',
    type: 'string',
  })
  @ApiBody({ type: DeleteCommentDto, description: 'Comment deletion data' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Req() req: express.Request,
    @Query('commentId') commentId: string,
    @Body() dto: DeleteCommentDto,
  ) {
    return this.commentService.deleteComment(req, commentId, dto);
  }
}
