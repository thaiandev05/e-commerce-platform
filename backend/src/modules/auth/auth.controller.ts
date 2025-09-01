import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyAccountWithCodeDto } from './dto/verify-account-with-code.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) { }

	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@Post('vefify-account-with-code')
	async verifyAccountWithCode(@Body() dto: VerifyAccountWithCodeDto) {
		return this.authService.verifyAccountWithCode(dto)
	}
}
