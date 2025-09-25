export class LoadingMessageDto {
	page?: number = 1
	limit?: number = 20
	cursor?: string
	skip?: number
	isUseCursor: boolean = false
}