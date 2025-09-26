import { IsString, IsOptional, IsBoolean, IsNotEmpty, Length, IsUUID, IsEnum, IsArray, IsUrl, IsNumber, Min, Max } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CommentType, CommentStatus } from './create-comment.dto'

export class UpdateCommentDto {
	@ApiProperty({
		description: 'ID of the comment to update',
		example: 'uuid-comment-id'
	})
	@IsUUID('4', { message: 'Invalid comment ID format' })
	@IsNotEmpty()
	commentId: string

	@ApiPropertyOptional({
		description: 'Updated comment content',
		example: 'Updated review after using the product for a month',
		minLength: 1,
		maxLength: 2000
	})
	@IsOptional()
	@IsString()
	@Length(1, 2000, { message: 'Comment content must be between 1 and 2000 characters' })
	@Transform(({ value }) => value?.trim())
	content?: string

	@ApiPropertyOptional({
		description: 'Updated rating (1-5 stars)',
		minimum: 1,
		maximum: 5,
		example: 4
	})
	@IsOptional()
	@IsNumber({}, { message: 'Rating must be a number' })
	@Type(() => Number)
	@Min(1, { message: 'Rating must be at least 1' })
	@Max(5, { message: 'Rating cannot exceed 5' })
	rating?: number

	@ApiPropertyOptional({
		description: 'Updated title or subject',
		example: 'Good product with minor issues',
		maxLength: 200
	})
	@IsOptional()
	@IsString()
	@Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
	@Transform(({ value }) => value?.trim())
	title?: string

	@ApiPropertyOptional({
		description: 'Updated comment type',
		enum: CommentType,
		example: CommentType.PRODUCT_REVIEW
	})
	@IsOptional()
	@IsEnum(CommentType)
	commentType?: CommentType

	@ApiPropertyOptional({
		description: 'Updated image URLs',
		type: [String],
		example: ['https://example.com/updated-image.jpg']
	})
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
	imageUrls?: string[]

	@ApiPropertyOptional({
		description: 'Updated video URLs',
		type: [String],
		example: ['https://example.com/updated-video.mp4']
	})
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true, message: 'Each video must be a valid URL' })
	videoUrls?: string[]

	@ApiPropertyOptional({
		description: 'Updated tags',
		type: [String],
		example: ['quality', 'updated-review']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 50, { each: true, message: 'Each tag must be between 1 and 50 characters' })
	tags?: string[]

	@ApiPropertyOptional({
		description: 'Updated recommendation status',
		example: false
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isRecommended?: boolean

	@ApiPropertyOptional({
		description: 'Updated pros',
		type: [String],
		example: ['Still good quality', 'Price is reasonable']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 200, { each: true, message: 'Each pro must be between 1 and 200 characters' })
	pros?: string[]

	@ApiPropertyOptional({
		description: 'Updated cons',
		type: [String],
		example: ['Durability concerns after extended use']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 200, { each: true, message: 'Each con must be between 1 and 200 characters' })
	cons?: string[]

	@ApiPropertyOptional({
		description: 'SKU ID associated with the comment',
		example: 'SKU-12345'
	})
	@IsOptional()
	@IsString()
	skuId?: string

	@ApiPropertyOptional({
		description: 'Updated metadata',
		example: { lastModified: '2025-09-26', editReason: 'typo correction' }
	})
	@IsOptional()
	metadata?: Record<string, any>
}