import { Module } from "@nestjs/common";
import { MessageService } from "./service/message.service";
import { TestController } from "./test.feature.controller";

@Module({
	providers: [MessageService],
	controllers: [TestController]
})
export class ChatModule {

}