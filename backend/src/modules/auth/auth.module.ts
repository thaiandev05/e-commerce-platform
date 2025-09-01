import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '@/email/email.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [EmailModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
