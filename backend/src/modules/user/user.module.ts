import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserConctroller } from './user.controller';

@Module({
  controllers: [UserConctroller],
  providers: [UserService]
})
export class UserModule { }
