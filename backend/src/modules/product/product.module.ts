import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { RolesGuard } from '@/common/guard/role.guard';

@Module({
  providers: [ProductService,
    {
      provide: APP_GUARD,
      inject: [Reflector, PrismaService],
      useFactory: (reflector: Reflector, prismaService: PrismaService) => new RolesGuard(reflector, prismaService)
    }
  ],
  controllers: [ProductController]
})
export class ProductModule { }
