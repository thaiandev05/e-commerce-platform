import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyAccountWithCodeDto } from './dto/verify-account-with-code.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) { }

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiCreatedResponse({ description: 'User successfully registered' })
	@ApiBadRequestResponse({ description: 'Invalid input / validation error' })
	@ApiBody({ type: RegisterDto })
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@Post('vefify-account-with-code')
	@ApiOperation({ summary: 'Verify account with code' })
	@ApiResponse({ status: 200, description: 'Account verified' })
	@ApiBadRequestResponse({ description: 'Invalid code or request' })
	@ApiBody({ type: VerifyAccountWithCodeDto })
	async verifyAccountWithCode(@Body() dto: VerifyAccountWithCodeDto) {
		return this.authService.verifyAccountWithCode(dto)
	}
}
