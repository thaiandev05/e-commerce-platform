import { SpuStatus } from "@prisma/generated/prisma"

export class CreateSpuDto {
	name: string
	slug: string
	description?: string
	shortDesc?: string
	status: SpuStatus = SpuStatus.DRAFT
	isActive: boolean = true
	categoryId: string
	brandId: string
}