import { RolesGuard } from '@/common/guard/role.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { ProductController } from './product.controller';
import { ProductSearchService } from './service/product.search.service';
import { ProductService } from './service/product.service';

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
