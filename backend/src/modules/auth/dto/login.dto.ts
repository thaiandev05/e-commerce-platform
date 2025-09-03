import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
	@IsNotEmpty({ message: 'Account is required.' })
	@IsString()
	account: string

	@IsNotEmpty({ message: 'Password is required.' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters.' })
	@MaxLength(32, { message: 'Password must be at most 32 characters.' })
	password: string
}