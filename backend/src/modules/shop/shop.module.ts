import { Module } from '@nestjs/common';
import { ShopService } from './services/shop.service';
import { ShopController } from './shop.controller';
import { EmailModule } from '@/email/email.module';
import { SearchServiceShop } from './services/shop.search.service';
import { ShopResolver } from './shop.resolver';
import { RedisModule } from '../redis/redis.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { RolesGuard } from '@/common/guard/role.guard';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [EmailModule, RedisModule],
  providers: [
    ShopService, SearchServiceShop, ShopResolver,
    {
      provide: APP_GUARD,
      inject: [Reflector, PrismaService],
      useFactory: (reflector: Reflector, prismaService: PrismaService) => new RolesGuard(reflector, prismaService)
    }
  ],
  controllers: [ShopController]
})
export class ShopModule { }
