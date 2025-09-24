export class CreateMessageDto {
	content: string
	roomId: string
	isRepLy?: boolean = false
	receiverId: string
}