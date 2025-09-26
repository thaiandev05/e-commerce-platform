import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

import type { Message_Queue } from '@/modules/chat/interface/chat.interface';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
    private client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.TCP, // or your transport method
        });
    }

    @Post('send')
    @ApiOperation({ summary: 'Send a message to queue' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid message data' })
    @ApiBody({
        description: 'Message data to be queued',
        schema: {
            type: 'object',
            properties: {
                content: { type: 'string' },
                senderId: { type: 'string' },
                receiverId: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' }
            }
        }
    })
    async sendMessage(@Body() messageData: Message_Queue) {
        return this.client.emit('SAVE_MESSAGE', messageData);
    }
}