import { IsOptional, IsString, IsUUID, IsNumber, IsDateString, IsEnum, Min, Max } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export enum MessageSortBy {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	CONTENT = 'content'
}

export enum MessageSortOrder {
	ASC = 'asc',
	DESC = 'desc'
}

export class FindingMessageDto {
	@ApiPropertyOptional({
		description: 'Search keyword in message content',
		example: 'product question',
		maxLength: 200
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim())
	search?: string

	@ApiPropertyOptional({
		description: 'Room ID to search messages in',
		example: 'uuid-room-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid room ID format' })
	roomId?: string

	@ApiPropertyOptional({
		description: 'User ID who sent the message',
		example: 'uuid-user-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid user ID format' })
	senderId?: string

	@ApiPropertyOptional({
		description: 'User ID who received the message',
		example: 'uuid-receiver-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid receiver ID format' })
	receiverId?: string

	@ApiPropertyOptional({
		description: 'Search messages from this date',
		example: '2025-09-25T00:00:00Z'
	})
	@IsOptional()
	@IsDateString({}, { message: 'Invalid from date format' })
	fromDate?: string

	@ApiPropertyOptional({
		description: 'Search messages until this date',
		example: '2025-09-26T23:59:59Z'
	})
	@IsOptional()
	@IsDateString({}, { message: 'Invalid to date format' })
	toDate?: string

	@ApiPropertyOptional({
		description: 'Number of messages to return',
		minimum: 1,
		maximum: 100,
		default: 20,
		example: 20
	})
	@IsOptional()
	@IsNumber({}, { message: 'Limit must be a number' })
	@Type(() => Number)
	@Min(1, { message: 'Limit must be at least 1' })
	@Max(100, { message: 'Limit cannot exceed 100' })
	limit?: number = 20

	@ApiPropertyOptional({
		description: 'Number of messages to skip',
		minimum: 0,
		default: 0,
		example: 0
	})
	@IsOptional()
	@IsNumber({}, { message: 'Offset must be a number' })
	@Type(() => Number)
	@Min(0, { message: 'Offset must be at least 0' })
	offset?: number = 0

	@ApiPropertyOptional({
		description: 'Sort messages by field',
		enum: MessageSortBy,
		example: MessageSortBy.CREATED_AT
	})
	@IsOptional()
	@IsEnum(MessageSortBy)
	sortBy?: MessageSortBy = MessageSortBy.CREATED_AT

	@ApiPropertyOptional({
		description: 'Sort order',
		enum: MessageSortOrder,
		example: MessageSortOrder.DESC
	})
	@IsOptional()
	@IsEnum(MessageSortOrder)
	sortOrder?: MessageSortOrder = MessageSortOrder.DESC
}