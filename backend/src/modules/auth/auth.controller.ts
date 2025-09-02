import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import express from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyAccountWithCodeDto } from './dto/verify-account-with-code.dto';
import { AuthService } from './services/auth.service';

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

	@Post('login')
	async login(@Res({ passthrough: true }) res: express.Response, @Body() dto: LoginDto) {
		return this.authService.login(dto, res)
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	@ApiOperation({ summary: 'Initiate Google OAuth2 login' })
	@ApiResponse({ status: 302, description: 'Redirect to Google OAuth2' })
	async googleAuth(@Req() req) {
		// This will redirect to Google OAuth
		return
	}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	@ApiOperation({ summary: 'Google OAuth2 callback handler' })
	@ApiResponse({ status: 200, description: 'OAuth2 login successful' })
	@ApiBadRequestResponse({ description: 'Invalid OAuth2 data' })
	async googleAuthCallback(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
		return this.authService.oauth2Login(req.user as any, res)
	}

	@Get('facebook')
	@UseGuards(AuthGuard('facebook'))
	@ApiOperation({ summary: 'Initiate Facebook OAuth2 login' })
	@ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth2' })
	async facebookAuth(@Req() req) {
		// This will redirect to Facebook OAuth
		return
	}

	@Get('facebook/callback')
	@UseGuards(AuthGuard('facebook'))
	@ApiOperation({ summary: 'Facebook OAuth2 callback handler' })
	@ApiResponse({ status: 200, description: 'OAuth2 login successful' })
	@ApiBadRequestResponse({ description: 'Invalid OAuth2 data' })
	async facebookAuthCallback(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
		return this.authService.oauth2Login(req.user as any, res)
	}
}
