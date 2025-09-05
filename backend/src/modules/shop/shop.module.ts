import { Module } from '@nestjs/common';
import { ShopService } from './services/shop.service';
import { ShopController } from './shop.controller';
import { EmailModule } from '@/email/email.module';
import { SearchServiceShop } from './services/shop.search.service';
import { ShopResolver } from './shop.resolver';

@Module({
  imports: [EmailModule],
  providers: [ShopService, SearchServiceShop, ShopResolver],
  controllers: [ShopController]
})
export class ShopModule { }
