export class FindingMessageDto {
	page?: number = 1
	limit?: number = 20
	cursor?: number
	skip?: number
	isUseCursor: boolean = false
	prompt: string
}