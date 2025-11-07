import { Global, Module } from '@nestjs/common';
import { EventBustService } from './evenbus.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductModule } from '../product/product.module';
import { EventConsumer } from './even.consumer';
@Global()
@Module({
  imports: [EventEmitterModule.forRoot(), ProductModule],
  providers: [EventBustService, EventConsumer],
  exports: [EventBustService],
})
export class EventbusModule {}
