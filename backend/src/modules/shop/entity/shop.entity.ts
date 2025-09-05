import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Shop, ShopStatus } from "@prisma/generated/prisma";

registerEnumType(ShopStatus, {
	name: 'ShopStatus'
})


@ObjectType()
export class ShopQl implements Partial<Shop> {
	@Field(type => String, {})
	id: string

	@Field(type => String)
	name: string

	@Field(type => String)
	slug: string

	@Field(type => String, {
		nullable: true
	})
	description: string

	@Field(type => String, {
		nullable: true
	})
	logoUrl: string

	@Field(type => String, {
		nullable: true
	})
	bannerUrl: string

	@Field(type => String, {
		nullable: true
	})
	email: string

	@Field(type => String, {
		nullable: true
	})
	phone: string

	@Field(type => String, {
		nullable: true
	})
	address: string

	@Field(type => String, {
		nullable: true
	})
	website: string

	@Field(type => ShopStatus, {
		defaultValue: ShopStatus.PENDING
	})
	status: ShopStatus
	@Field(type => Boolean, {
		defaultValue: true
	})
	isActive: boolean
	@Field(type => Boolean, {
		defaultValue: false
	})
	isVerified: boolean
	@Field(type => Number)
	totalReviews: number
	@Field(type => Date)
	createdAt: Date
	@Field(type => Date)
	updatedAt: Date

	@Field(type => String)
	ownerId: string	
}