import { SpuStatus } from "@prisma/generated/prisma"
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator"

export class UpdateSpuDto {
	@IsOptional()
	@IsString()
	@MinLength(2, { message: 'SPU name must be at least 2 characters.' })
	@MaxLength(200, { message: 'SPU name must be at most 200 characters.' })
	name?: string

	@IsOptional()
	@IsString()
	@MinLength(2, { message: 'Slug must be at least 2 characters.' })
	@MaxLength(200, { message: 'Slug must be at most 200 characters.' })
	slug?: string

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
	status?: SpuStatus = SpuStatus.DRAFT
}