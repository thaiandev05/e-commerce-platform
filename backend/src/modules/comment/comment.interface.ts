export interface CommentUser {
	id: string
	username: string
	avataUrl?: string | null
}

export interface Comment_Queue {
	content: string
	ownId: string
	skuId: string
	isReply?: boolean 
	repToComment?: string
}