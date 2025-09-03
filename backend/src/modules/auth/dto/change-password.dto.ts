import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
	@IsNotEmpty({ message: 'Old password is required.' })
	@IsString()
	oldPassword: string

	@IsNotEmpty({ message: 'New password is required.' })
	@IsString()
	@MinLength(8, { message: 'New password must be at least 8 characters.' })
	@MaxLength(32, { message: 'New password must be at most 32 characters.' })
	newPassword: string
}