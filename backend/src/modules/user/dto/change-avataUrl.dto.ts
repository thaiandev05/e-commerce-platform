import { IsOptional, IsUrl, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeAvataUrlDto {
	@ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL of the user avatar', required: false })
	@IsOptional()
	@IsString()
	@IsUrl({}, { message: 'Invalid URL for avatar.' })
	@MaxLength(2048, { message: 'Avatar URL must be at most 2048 characters.' })
	avataUrl?: string
}