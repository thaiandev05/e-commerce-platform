import { EmailModule } from '@/email/email.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { CookieStrategy } from './strategy/cookie.strategy';

@Module({
  imports: [
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: '1d' }
      })
    })
  ],
  providers: [AuthService, TokenService, GoogleStrategy, FacebookStrategy, JwtStrategy, CookieStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
