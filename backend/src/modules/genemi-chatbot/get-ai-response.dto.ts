import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GetResponseDto {
	@ApiProperty({
		description: 'User prompt/question for AI',
		example: 'Tìm giúp tôi laptop gaming dưới 20 triệu',
		maxLength: 1000
	})
	@IsString()
	@IsNotEmpty({ message: 'Prompt cannot be empty' })
	@MaxLength(1000, { message: 'Prompt is too long (max 1000 characters)' })
	prompt: string

	@ApiProperty({
		description: 'Chat session ID for conversation continuity',
		required: false,
		example: 'uuid-session-id'
	})
	@IsOptional()
	@IsString()
	sessionId?: string

	@ApiProperty({
		description: 'User ID for personalization',
		required: false,
		example: 'user-uuid'
	})
	@IsOptional()
	@IsString()
	userId?: string

	payload?: string

	isTracking?: boolean = false

	orderId?: string

	isRecommendation?: boolean = false
}