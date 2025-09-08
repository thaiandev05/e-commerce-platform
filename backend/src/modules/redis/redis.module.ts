import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({}),
            new KeyvRedis('redis://localhost:6379')
          ]
        }
      }
    }),
  ],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule { }
