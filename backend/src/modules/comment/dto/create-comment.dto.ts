import { IsString, IsOptional, IsBoolean, IsNotEmpty, Length, IsUUID, IsEnum, IsArray, IsUrl, IsNumber, Min, Max } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum CommentType {
	PRODUCT_REVIEW = 'product_review',
	SELLER_REVIEW = 'seller_review',
	ORDER_FEEDBACK = 'order_feedback',
	GENERAL_COMMENT = 'general_comment',
	QUESTION = 'question',
	ANSWER = 'answer'
}

export enum CommentStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	FLAGGED = 'flagged'
}

export class CreateCommentDto {
	@ApiProperty({
		description: 'Comment content',
		example: 'Great product! Highly recommend it.',
		minLength: 1,
		maxLength: 2000
	})
	@IsString()
	@IsNotEmpty()
	@Length(1, 2000, { message: 'Comment content must be between 1 and 2000 characters' })
	@Transform(({ value }) => value?.trim())
	content: string

	@ApiPropertyOptional({
		description: 'Whether this is a reply to another comment',
		default: false,
		example: false
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isReply?: boolean = false

	@ApiPropertyOptional({
		description: 'ID of the comment being replied to (required if isReply is true)',
		example: 'uuid-comment-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid comment ID format' })
	repToCommentId?: string

	@ApiPropertyOptional({
		description: 'Type of comment',
		enum: CommentType,
		example: CommentType.PRODUCT_REVIEW
	})
	@IsOptional()
	@IsEnum(CommentType)
	commentType?: CommentType = CommentType.GENERAL_COMMENT

	@ApiPropertyOptional({
		description: 'Rating associated with the comment (1-5 stars)',
		minimum: 1,
		maximum: 5,
		example: 5
	})
	@IsOptional()
	@IsNumber({}, { message: 'Rating must be a number' })
	@Type(() => Number)
	@Min(1, { message: 'Rating must be at least 1' })
	@Max(5, { message: 'Rating cannot exceed 5' })
	rating?: number

	@ApiPropertyOptional({
		description: 'ID of the product being commented on',
		example: 'uuid-product-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid product ID format' })
	productId?: string

	@ApiPropertyOptional({
		description: 'ID of the seller being commented on',
		example: 'uuid-seller-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid seller ID format' })
	sellerId?: string

	@ApiPropertyOptional({
		description: 'ID of the order related to this comment',
		example: 'uuid-order-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid order ID format' })
	orderId?: string

	@ApiPropertyOptional({
		description: 'Whether the comment is anonymous',
		default: false,
		example: false
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isAnonymous?: boolean = false

	@ApiPropertyOptional({
		description: 'Title or subject of the comment',
		example: 'Excellent quality and fast shipping',
		maxLength: 200
	})
	@IsOptional()
	@IsString()
	@Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
	@Transform(({ value }) => value?.trim())
	title?: string

	@ApiPropertyOptional({
		description: 'URLs of attached images',
		type: [String],
		example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
	})
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
	imageUrls?: string[]

	@ApiPropertyOptional({
		description: 'URLs of attached videos',
		type: [String],
		example: ['https://example.com/video1.mp4']
	})
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true, message: 'Each video must be a valid URL' })
	videoUrls?: string[]

	@ApiPropertyOptional({
		description: 'Tags associated with the comment',
		type: [String],
		example: ['quality', 'shipping', 'recommended']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 50, { each: true, message: 'Each tag must be between 1 and 50 characters' })
	tags?: string[]

	@ApiPropertyOptional({
		description: 'Whether the commenter recommends the product/seller',
		example: true
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isRecommended?: boolean

	@ApiPropertyOptional({
		description: 'Pros mentioned in the comment',
		type: [String],
		example: ['Good quality', 'Fast delivery', 'Great price']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 200, { each: true, message: 'Each pro must be between 1 and 200 characters' })
	pros?: string[]

	@ApiPropertyOptional({
		description: 'Cons mentioned in the comment',
		type: [String],
		example: ['Packaging could be better']
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Length(1, 200, { each: true, message: 'Each con must be between 1 and 200 characters' })
	cons?: string[]

	@ApiPropertyOptional({
		description: 'Whether the comment is a verified purchase',
		default: false,
		example: true
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isVerifiedPurchase?: boolean = false

	@ApiPropertyOptional({
		description: 'Language code of the comment',
		example: 'en',
		default: 'en'
	})
	@IsOptional()
	@IsString()
	@Length(2, 5, { message: 'Language code must be between 2 and 5 characters' })
	language?: string = 'en'

	@ApiPropertyOptional({
		description: 'Additional metadata for the comment',
		example: { source: 'mobile_app', version: '1.0.0' }
	})
	@IsOptional()
	metadata?: Record<string, any>

	@ApiPropertyOptional({
		description: 'Whether to send email notifications for replies',
		default: true,
		example: true
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	emailNotifications?: boolean = true

	@ApiPropertyOptional({
		description: 'Scheduled publication date (for delayed publishing)',
		example: '2025-12-31T23:59:59Z'
	})
	@IsOptional()
	@Type(() => Date)
	scheduledAt?: Date

	@ApiPropertyOptional({
		description: 'Priority level of the comment',
		minimum: 1,
		maximum: 10,
		example: 5
	})
	@IsOptional()
	@IsNumber({}, { message: 'Priority must be a number' })
	@Type(() => Number)
	@Min(1, { message: 'Priority must be at least 1' })
	@Max(10, { message: 'Priority cannot exceed 10' })
	priority?: number = 5
}