import { ShopQl } from "@/modules/shop/entity/shop.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User, AccountType, UserRole, UserFlag, UserVisibility } from "@prisma/generated/prisma";

registerEnumType(AccountType, {
	name: 'AccountType'
})

registerEnumType(UserRole, {
	name: 'UserRole'
})

registerEnumType(UserFlag, {
	name: 'UserFlag'
})

registerEnumType(UserVisibility, {
	name: 'UserVisibility'
})

@ObjectType()
export class UserQl implements Partial<User> {
	@Field(type => String, {})
	id: string

	@Field(type => String)
	fullname: string

	@Field(type => String)
	username: string

	@Field(type => String)
	email: string

	@Field(type => String, {
		nullable: true
	})
	phone: string

	@Field(type => String, {
		nullable: true
	})
	hashingPassword: string

	@Field(type => AccountType, {
		defaultValue: AccountType.EMAIL
	})
	accountType: AccountType

	@Field(type => String, {
		nullable: true
	})
	avatarUrl: string

	@Field(type => String, {
		nullable: true
	})
	address: string

	@Field(type => String, {
		nullable: true
	})
	city: string

	@Field(type => String, {
		nullable: true
	})
	state: string

	@Field(type => [UserRole])
	roles: UserRole[]

	@Field(type => [UserFlag])
	flags: UserFlag[]

	@Field(type => Date)
	createdAt: Date

	@Field(type => Date)
	updatedAt: Date

	@Field(type => UserVisibility, {
		defaultValue: UserVisibility.PUBLIC
	})
	visible: UserVisibility

	@Field(type => Boolean, {
		defaultValue: false
	})
	isBanned: boolean

	@Field(type => Boolean, {
		defaultValue: false
	})
	isLocked: boolean

	@Field(type => Boolean, {
		defaultValue: false
	})
	isVerified: boolean

	@Field(type => Date, {
		nullable: true
	})
	lastActived: Date

	@Field(type => [ShopQl], { nullable: true })
	shop?: ShopQl[]
}
