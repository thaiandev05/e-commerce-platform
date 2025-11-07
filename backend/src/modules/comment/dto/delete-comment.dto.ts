import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteCommentDto {
  @ApiProperty({
    description: 'ID of the comment to delete',
    example: 'uuid-comment-id',
  })
  @IsUUID('4', { message: 'Invalid comment ID format' })
  @IsNotEmpty()
  commentId: string;

  @ApiPropertyOptional({
    description: 'Reason for deleting the comment',
    example: 'Inappropriate content',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'SKU ID associated with the comment',
    example: 'SKU-12345',
  })
  @IsOptional()
  @IsString()
  skuId?: string;
}
