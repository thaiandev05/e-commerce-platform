import { IsString, IsOptional, IsBoolean, IsNotEmpty, Length, IsUUID, IsArray, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum RoomType {
	DIRECT = 'direct',
	GROUP = 'group',
	SUPPORT = 'support',
	SELLER_BUYER = 'seller_buyer'
}

export class CreateRoomDto {
	@ApiProperty({
		description: 'Room name',
		example: 'Product Discussion',
		minLength: 1,
		maxLength: 100
	})
	@IsString()
	@IsNotEmpty()
	@Length(1, 100, { message: 'Room name must be between 1 and 100 characters' })
	@Transform(({ value }) => value?.trim())
	name: string

	@ApiPropertyOptional({
		description: 'Room description',
		example: 'Discussion about iPhone 15 Pro',
		maxLength: 500
	})
	@IsOptional()
	@IsString()
	@Length(1, 500, { message: 'Description must be between 1 and 500 characters' })
	@Transform(({ value }) => value?.trim())
	description?: string

	@ApiPropertyOptional({
		description: 'Type of the chat room',
		enum: RoomType,
		example: RoomType.DIRECT
	})
	@IsOptional()
	@IsEnum(RoomType)
	type?: RoomType = RoomType.DIRECT

	@ApiPropertyOptional({
		description: 'Whether the room is private',
		default: true,
		example: true
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isPrivate?: boolean = true

	@ApiPropertyOptional({
		description: 'List of participant user IDs',
		type: [String],
		example: ['uuid-user-1', 'uuid-user-2']
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true, message: 'Each participant ID must be a valid UUID' })
	participantIds?: string[]

	@ApiPropertyOptional({
		description: 'Maximum number of participants allowed',
		example: 10,
		default: 2
	})
	@IsOptional()
	maxParticipants?: number = 2

	@ApiPropertyOptional({
		description: 'Room avatar/image URL',
		example: 'https://example.com/room-avatar.jpg'
	})
	@IsOptional()
	@IsString()
	avatarUrl?: string
}