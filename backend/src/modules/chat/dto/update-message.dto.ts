export class UpdateMessageDto {
	newContent: string
	roomId: string
	isRepLy?: boolean = false
	messageId: string
}