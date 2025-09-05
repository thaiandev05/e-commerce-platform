import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl, MinLength, MaxLength } from 'class-validator';

export class CreateShopDto {
	@IsNotEmpty({ message: 'Shop name is required.' })
	@IsString()
	@MinLength(2, { message: 'Shop name must be at least 2 characters.' })
	@MaxLength(100, { message: 'Shop name must be at most 100 characters.' })
	name: string

	@IsOptional()
	@IsString()
	@MaxLength(1000, { message: 'Description must be at most 1000 characters.' })
	desciption?: string

	@IsOptional()
	@IsUrl({}, { message: 'Invalid logo URL.' })
	logoUrl?: string

	@IsOptional()
	@IsUrl({}, { message: 'Invalid banner URL.' })
	bannerUrl?: string

	@IsOptional()
	@IsEmail({}, { message: 'Invalid email address.' })
	email?: string

	@IsOptional()
	@IsString()
	@MinLength(7, { message: 'Phone must be at least 7 characters.' })
	@MaxLength(20, { message: 'Phone must be at most 20 characters.' })
	phone?: string

	@IsOptional()
	@IsString()
	@MaxLength(255, { message: 'Address must be at most 255 characters.' })
	address?: string

	@IsOptional()
	@IsUrl({}, { message: 'Invalid website URL.' })
	website?: string
}