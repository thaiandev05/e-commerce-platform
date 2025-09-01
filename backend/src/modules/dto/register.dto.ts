import { IsEmail, MinLength, MaxLength, IsAlphanumeric } from 'class-validator';

export class RegisterDto {
	@IsEmail()
	email: string;

	@MinLength(8)
	@MaxLength(32)
	password: string;

	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(20)
	username: string;

	@MinLength(2)
	@MaxLength(50)
	fullname: string;
}