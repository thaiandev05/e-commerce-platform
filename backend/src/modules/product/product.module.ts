import { Module } from '@nestjs/common';
import { ProductService } from './service/product.service';
import { ProductController } from './product.controller';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { RolesGuard } from '@/common/guard/role.guard';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { ProductSearchService } from './service/product.search.service';

@Module({
  imports: [ElasticsearchModule],
  providers: [ProductService, ProductSearchService,
    {
      provide: APP_GUARD,
      inject: [Reflector, PrismaService],
      useFactory: (reflector: Reflector, prismaService: PrismaService) => new RolesGuard(reflector, prismaService)
    }
  ],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule { }
