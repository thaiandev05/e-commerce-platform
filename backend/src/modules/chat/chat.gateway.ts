import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatgateWayService } from './service/chat.gateway.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
	cors: {
		origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
		credentials: true,
	},
	transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatGatewayService: ChatgateWayService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) { }

	async afterInit(server: Server) {
		try {
			// Setup Redis adapter for scaling WebSocket across multiple instances
			const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');

			const pubClient = createClient({ url: redisUrl });
			const subClient = pubClient.duplicate();

			await Promise.all([pubClient.connect(), subClient.connect()]);

			server.adapter(createAdapter(pubClient, subClient));

			this.logger.log('WebSocket Gateway initialized with Redis adapter');
		} catch (error) {
			this.logger.error('Failed to initialize Redis adapter:', error);
		}
	}

	async handleConnection(client: Socket) {
		try {
			this.logger.log(`Client attempting to connect: ${client.id}`);

			// Authenticate user on connection
			const user = await this.authenticateSocket(client);
			if (!user) {
				this.logger.warn(`Authentication failed for client: ${client.id}`);
				client.emit('authError', { message: 'Authentication failed' });
				client.disconnect(true);
				return;
			}

			// Store user data in socket
			client.data.user = user;

			this.logger.log(`Client connected successfully: ${client.id} (User: ${user.username})`);

			// Emit connection success
			client.emit('connected', {
				message: 'Connected successfully',
				user: {
					id: user.id,
					username: user.username,
					fullname: user.fullname,
				},
			});

		} catch (error) {
			this.logger.error(`Connection error for client ${client.id}:`, error);
			client.disconnect(true);
		}
	}

	async handleDisconnect(client: Socket) {
		try {
			const user = client.data.user;
			if (user) {
				this.logger.log(`Client disconnected: ${client.id} (User: ${user.username})`);

				// Clean up user data when they disconnect
				await this.chatGatewayService.handleUserDisconnect(client.id, user.id);
			} else {
				this.logger.log(`Client disconnected: ${client.id} (Unauthenticated)`);
			}
		} catch (error) {
			this.logger.error(`Disconnect cleanup error for client ${client.id}:`, error);
		}
	}

	@SubscribeMessage('joinConversation')
	async handleJoinConversation(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	) {
		try {
			const user = client.data.user;
			if (!user) {
				client.emit('joinConversationResponse', {
					success: false,
					error: 'Authentication required',
				});
				return;
			}

			this.logger.log(`User ${user.username} attempting to join room: ${data.roomId}`);

			const result = await this.chatGatewayService.joinConversation(
				client.id,
				data.roomId,
				user.id,
			);

			if (result.success) {
				// Join the Socket.IO room
				await client.join(data.roomId);

				// Notify others in the room about the user joining
				client.to(data.roomId).emit('userJoinedRoom', {
					userId: user.id,
					username: user.username,
					fullname: user.fullname,
					roomId: data.roomId,
					message: `${user.fullname} joined the conversation`,
					timestamp: new Date().toISOString(),
				});

				// Send success response back to client
				client.emit('joinConversationResponse', {
					success: true,
					roomId: data.roomId,
					message: 'Successfully joined conversation',
					roomInfo: result.roomInfo,
				});

				this.logger.log(`User ${user.username} successfully joined room ${data.roomId}`);
			} else {
				client.emit('joinConversationResponse', {
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			this.logger.error(`Error joining conversation: ${error.message}`, error.stack);
			client.emit('joinConversationResponse', {
				success: false,
				error: 'Internal server error',
			});
		}
	}

	@SubscribeMessage('leaveConversation')
	async handleLeaveConversation(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	) {
		try {
			const user = client.data.user;
			if (!user) {
				client.emit('leaveConversationResponse', {
					success: false,
					error: 'Authentication required',
				});
				return;
			}

			const result = await this.chatGatewayService.leaveConversation(
				client.id,
				data.roomId,
				user.id,
			);

			if (result.success) {
				// Leave the Socket.IO room
				await client.leave(data.roomId);

				// Notify others in the room about the user leaving
				client.to(data.roomId).emit('userLeftRoom', {
					userId: user.id,
					username: user.username,
					fullname: user.fullname,
					roomId: data.roomId,
					message: `${user.fullname} left the conversation`,
					timestamp: new Date().toISOString(),
				});

				// Send success response back to client
				client.emit('leaveConversationResponse', {
					success: true,
					roomId: data.roomId,
					message: 'Successfully left conversation',
				});

				this.logger.log(`User ${user.username} left room ${data.roomId}`);
			} else {
				client.emit('leaveConversationResponse', {
					success: false,
					error: result.error,
				});
			}
		} catch (error) {
			this.logger.error(`Error leaving conversation: ${error.message}`, error.stack);
			client.emit('leaveConversationResponse', {
				success: false,
				error: 'Internal server error',
			});
		}
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: {
			roomId: string;
			content: string;
			receiverId: string;
			repToId?: string;
		},
	) {
		try {
			const user = client.data.user;
			if (!user) {
				client.emit('messageError', {
					error: 'Authentication required',
				});
				return;
			}

			const messageData = {
				...data,
				senderId: user.id,
			};

			const result = await this.chatGatewayService.sendMessage(messageData);

			if (result.success) {
				// Broadcast message to all clients in the room
				this.server.to(data.roomId).emit('newMessage', {
					...result.message,
					sender: {
						id: user.id,
						username: user.username,
						fullname: user.fullname,
					},
					timestamp: new Date().toISOString(),
				});

				// Send confirmation to sender
				client.emit('messageDelivered', {
					messageId: result.message?.id,
					roomId: data.roomId,
					timestamp: new Date().toISOString(),
				});

				this.logger.log(`Message sent to room ${data.roomId} by user ${user.username}`);
			} else {
				client.emit('messageError', {
					error: result.error,
				});
			}
		} catch (error) {
			this.logger.error(`Error sending message: ${error.message}`, error.stack);
			client.emit('messageError', {
				error: 'Failed to send message',
			});
		}
	}

	@SubscribeMessage('getRoomUsers')
	async handleGetRoomUsers(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	) {
		try {
			const user = client.data.user;
			if (!user) {
				client.emit('roomUsersError', {
					error: 'Authentication required',
				});
				return;
			}

			const users = await this.chatGatewayService.getRoomUsers(data.roomId);
			client.emit('roomUsersResponse', {
				roomId: data.roomId,
				users,
			});
		} catch (error) {
			this.logger.error(`Error getting room users: ${error.message}`, error.stack);
			client.emit('roomUsersError', {
				error: 'Failed to get room users',
			});
		}
	}

	@SubscribeMessage('typing')
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string; isTyping: boolean },
	) {
		try {
			const user = client.data.user;
			if (!user) return;

			// Broadcast typing status to other users in the room
			client.to(data.roomId).emit('userTyping', {
				userId: user.id,
				username: user.username,
				fullname: user.fullname,
				roomId: data.roomId,
				isTyping: data.isTyping,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			this.logger.error(`Error handling typing event: ${error.message}`, error.stack);
		}
	}

	@SubscribeMessage('ping')
	handlePing(@ConnectedSocket() client: Socket) {
		client.emit('pong', {
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Authenticate socket connection using JWT token
	 */
	private async authenticateSocket(client: Socket): Promise<any> {
		try {
			const token = this.extractTokenFromSocket(client);
			if (!token) {
				return null;
			}

			// Verify JWT token
			const payload = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
			});

			// Get user from service
			const user = await this.chatGatewayService.getUserById(payload.userId || payload.sub);

			return user;
		} catch (error) {
			this.logger.error(`Socket authentication failed: ${error.message}`);
			return null;
		}
	}

	/**
	 * Extract JWT token from socket handshake
	 */
	private extractTokenFromSocket(client: Socket): string | null {
		// Try to get token from authorization header
		const authHeader = client.handshake.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7);
		}

		// Try to get token from query parameters
		const tokenFromQuery = client.handshake.query.token;
		if (tokenFromQuery && typeof tokenFromQuery === 'string') {
			return tokenFromQuery;
		}

		// Try to get token from auth object in handshake
		const authToken = client.handshake.auth?.token;
		if (authToken && typeof authToken === 'string') {
			return authToken;
		}

		return null;
	}
}
