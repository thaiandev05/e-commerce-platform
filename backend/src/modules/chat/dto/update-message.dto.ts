import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateMessageDto {
	@ApiPropertyOptional({
		description: 'Updated message content',
		example: 'Updated: Hello, I have a question about this product.',
		minLength: 1,
		maxLength: 1000
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Length(1, 1000, { message: 'Message content must be between 1 and 1000 characters' })
	@Transform(({ value }) => value?.trim())
	content?: string

	@ApiPropertyOptional({
		description: 'Update reason',
		example: 'Corrected typo',
		maxLength: 200
	})
	@IsOptional()
	@IsString()
	@Length(1, 200, { message: 'Update reason must be between 1 and 200 characters' })
	@Transform(({ value }) => value?.trim())
	updateReason?: string
}