import { IsOptional, IsString, Length } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class DeleteMessageDto {
	@ApiPropertyOptional({
		description: 'Reason for deleting the message',
		example: 'Inappropriate content',
		maxLength: 200
	})
	@IsOptional()
	@IsString()
	@Length(1, 200, { message: 'Delete reason must be between 1 and 200 characters' })
	@Transform(({ value }) => value?.trim())
	deleteReason?: string
}