export class LoadingMessageDto {
	page?: number = 1
	limit?: number = 20
	cursor?: number
	skip?: number
	isUseCursor: boolean = false
}