import { Global, Module } from '@nestjs/common';
import { EventBustService } from './evenbus.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Global()
@Module({
	imports: [EventEmitterModule.forRoot()],
	providers: [EventBustService],
	exports: [EventBustService]
})
export class EventbusModule { }
