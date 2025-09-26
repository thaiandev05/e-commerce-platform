export class CreateCommentDto {
	isReply?: Boolean = false
	repToCommentId?: string
	content: string
}