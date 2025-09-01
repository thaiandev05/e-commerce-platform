import { IsEmail, MinLength, MaxLength, IsAlphanumeric, IsString, IsNotEmpty } from 'class-validator';

export class RegisterDto {
	@IsEmail({}, { message: 'Invalid email address.' })
	@IsNotEmpty({ message: 'Email is required.' })
	email: string;

	@IsNotEmpty({ message: 'Password is required.' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters.' })
	@MaxLength(32, { message: 'Password must be at most 32 characters.' })
	password: string;

	@IsAlphanumeric()
	@IsNotEmpty({ message: 'Username is required.' })
	@MinLength(3, { message: 'Username must be at least 3 characters.' })
	@MaxLength(20, { message: 'Username must be at most 20 characters.' })
	username: string;

	@IsString()
	@IsNotEmpty({ message: 'Full name is required.' })
	@MinLength(2, { message: 'Full name must be at least 2 characters.' })
	@MaxLength(50, { message: 'Full name must be at most 50 characters.' })
	fullname: string;
}