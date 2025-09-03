import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { EmailModule } from '@/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [ShopService],
  controllers: [ShopController]
})
export class ShopModule {}
