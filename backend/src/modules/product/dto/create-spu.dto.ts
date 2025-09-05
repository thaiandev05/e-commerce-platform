import { SpuStatus } from "@prisma/generated/prisma";
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export class CreateSpuDto {
	@IsNotEmpty({ message: 'SPU name is required.' })
	@IsString()
	@MinLength(2, { message: 'SPU name must be at least 2 characters.' })
	@MaxLength(200, { message: 'SPU name must be at most 200 characters.' })
	name: string

	@IsNotEmpty({ message: 'Slug is required.' })
	@IsString()
	@MinLength(2, { message: 'Slug must be at least 2 characters.' })
	@MaxLength(200, { message: 'Slug must be at most 200 characters.' })
	slug: string

	@IsOptional()
	@IsString()
	@MaxLength(3000, { message: 'Description must be at most 3000 characters.' })
	description?: string

	@IsOptional()
	@IsString()
	@MaxLength(500, { message: 'Short description must be at most 500 characters.' })
	shortDesc?: string

	@IsOptional()
	@IsEnum(SpuStatus)
	status: SpuStatus = SpuStatus.DRAFT

	@IsOptional()
	@IsBoolean()
	isActive: boolean = true

	@IsNotEmpty({ message: 'Category ID is required.' })
	@IsString()
	@IsUUID()
	categoryId: string

	@IsNotEmpty({ message: 'Brand ID is required.' })
	@IsString()
	@IsUUID()
	brandId: string
}