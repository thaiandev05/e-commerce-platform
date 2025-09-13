import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class EventBustService {
	constructor(private readonly emitter: EventEmitter2) { }

	emit(event: string, payload: any) {
		this.emitter.emit(event, payload)
	}

	on(event: string, handler: (...args: any[]) => void) {
		this.emitter.on(event, handler)
	}
}