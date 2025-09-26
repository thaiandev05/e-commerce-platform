import { IsString, IsOptional, IsBoolean, IsNotEmpty, Length, IsUUID } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMessageDto {
	@ApiProperty({
		description: 'Message content',
		example: 'Hello, I have a question about this product.',
		minLength: 1,
		maxLength: 1000
	})
	@IsString()
	@IsNotEmpty()
	@Length(1, 1000, { message: 'Message content must be between 1 and 1000 characters' })
	@Transform(({ value }) => value?.trim())
	content: string

	@ApiProperty({
		description: 'ID of the chat room',
		example: 'uuid-room-id'
	})
	@IsString()
	@IsNotEmpty()
	@IsUUID('4', { message: 'Invalid room ID format' })
	roomId: string

	@ApiPropertyOptional({
		description: 'Whether this message is a reply to another message',
		default: false,
		example: false
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === true || value === 'true')
	isReply?: boolean = false

	@ApiProperty({
		description: 'ID of the message receiver',
		example: 'uuid-receiver-id'
	})
	@IsString()
	@IsNotEmpty()
	@IsUUID('4', { message: 'Invalid receiver ID format' })
	receiverId: string
}