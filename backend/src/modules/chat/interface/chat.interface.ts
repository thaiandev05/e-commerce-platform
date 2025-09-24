export interface Message_Queue {
	id: string
	content: string
	roomId: string
	senderId: string,
	receiverId: string
	repToId: string | null
}