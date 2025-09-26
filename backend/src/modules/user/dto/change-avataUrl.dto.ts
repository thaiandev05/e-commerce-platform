import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeAvatarUrlDto {
	@ApiProperty({
		description: 'New avatar URL',
		example: 'https://example.com/avatar.jpg',
		type: String,
		format: 'url'
	})
	@IsString()
	@IsNotEmpty()
	@IsUrl({}, {
		message: 'Avatar URL must be a valid URL'
	})
	@Transform(({ value }) => value?.trim())
	avatarUrl: string;

	@ApiProperty({
		description: 'Alt text for the avatar image',
		example: 'User profile picture',
		required: false,
		maxLength: 100
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim())
	altText?: string;
}