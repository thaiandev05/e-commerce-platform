import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Patch,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import express from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyAccountWithCodeDto } from './dto/verify-account-with-code.dto';
import { AuthService } from './services/auth.service';
import { Cookies } from './decorator/cookie.decorator';
import { Public } from '@/common/decorator/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { softDeleteAccountDto } from './dto/soft-delete-account.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        name: { type: 'string', example: 'John Doe' },
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Public()
  @Post('verify-account-with-code')
  @ApiOperation({ summary: 'Verify account with code' })
  @ApiResponse({ status: 200, description: 'Account verified' })
  @ApiBadRequestResponse({ description: 'Invalid code or request' })
  @ApiBody({ type: VerifyAccountWithCodeDto })
  async verifyAccountWithCode(@Body() dto: VerifyAccountWithCodeDto) {
    return this.authService.verifyAccountWithCode(dto);
  }
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async login(
    @Res({ passthrough: true }) res: express.Response,
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto, res);
  }
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth2' })
  async googleAuth(@Req() req) {
    // This will redirect to Google OAuth
    return;
  }
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback handler' })
  @ApiResponse({ status: 200, description: 'OAuth2 login successful' })
  @ApiBadRequestResponse({ description: 'Invalid OAuth2 data' })
  async googleAuthCallback(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.oauth2Login(req.user as any, res);
  }
  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth2' })
  async facebookAuth(@Req() req) {
    return;
  }
  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth2 callback handler' })
  @ApiResponse({ status: 200, description: 'OAuth2 login successful' })
  @ApiBadRequestResponse({ description: 'Invalid OAuth2 data' })
  async facebookAuthCallback(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.oauth2Login(req.user as any, res);
  }

  @Public()
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: any) {
    // ...existing code...
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or token' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Req() req: express.Request,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, dto);
  }

  @Patch('soft-delete-account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete authenticated user account' })
  @ApiResponse({ status: 200, description: 'Account soft deleted.' })
  @ApiBadRequestResponse({ description: 'Invalid input or request' })
  @ApiBody({ type: softDeleteAccountDto })
  async softDeleteAccount(
    @Req() req: express.Request,
    @Body() dto: softDeleteAccountDto,
  ) {
    return this.authService.softDeleteAccount(req, dto);
  }
}
