import { IsOptional, IsNumber, IsString, IsUUID, IsDateString, Min, Max } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class LoadingMessageDto {
	@ApiPropertyOptional({
		description: 'Number of messages to load',
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
		description: 'Room ID to filter messages',
		example: 'uuid-room-id'
	})
	@IsOptional()
	@IsUUID('4', { message: 'Invalid room ID format' })
	roomId?: string

	@ApiPropertyOptional({
		description: 'Load messages before this date',
		example: '2025-09-26T10:00:00Z'
	})
	@IsOptional()
	@IsDateString({}, { message: 'Invalid date format' })
	before?: string

	@ApiPropertyOptional({
		description: 'Load messages after this date',
		example: '2025-09-25T10:00:00Z'
	})
	@IsOptional()
	@IsDateString({}, { message: 'Invalid date format' })
	after?: string

	@ApiPropertyOptional({
		description: 'Search keyword in message content',
		example: 'product question',
		maxLength: 100
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim())
	search?: string
}