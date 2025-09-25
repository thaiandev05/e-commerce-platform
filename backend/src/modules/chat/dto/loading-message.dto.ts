export class LoadingMessageDto {
	page?: number = 1
	limit?: number = 20
	skip?: number
	isUseCursor: boolean = false
}