import { IsOptional, IsString, IsAlphanumeric, MinLength, MaxLength, IsUrl, IsEmail } from 'class-validator';

export class changeDetailUserDto {
	@IsOptional()
	@IsString()
	@MinLength(2, { message: 'Full name must be at least 2 characters.' })
	@MaxLength(50, { message: 'Full name must be at most 50 characters.' })
	fullname?: string

	@IsOptional()
	@IsAlphanumeric()
	@MinLength(3, { message: 'Username must be at least 3 characters.' })
	@MaxLength(20, { message: 'Username must be at most 20 characters.' })
	username?: string

	@IsOptional()
	@IsString()
	@MaxLength(255, { message: 'Address must be at most 255 characters.' })
	address?: string

	@IsOptional()
	@IsString()
	@MaxLength(100, { message: 'City must be at most 100 characters.' })
	city?: string

	@IsOptional()
	@IsString()
	@MaxLength(100, { message: 'Country must be at most 100 characters.' })
	country?: string

	@IsOptional()
	@IsString()
	@MinLength(7, { message: 'Phone must be at least 7 characters.' })
	@MaxLength(20, { message: 'Phone must be at most 20 characters.' })
	phone?: string

}