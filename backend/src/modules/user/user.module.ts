import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserConctroller } from './user.controller';
import { UserSearchService } from './service/user.search.service';
import { RedisModule } from '@/modules/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [UserConctroller],
  providers: [UserService, UserSearchService],
})
export class UserModule {}
