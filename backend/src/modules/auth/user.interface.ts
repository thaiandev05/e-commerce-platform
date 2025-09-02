
export interface Payload {
	sub: string
	email: string
	createdAt: Date
}

export interface GoogleOAuth2User {
	providerUserId: string
	email: string
	fullname: string
	firstname?: string
	lastname?: string
	avatarUrl?: string
	username?: string
	provider: 'GOOGLE'
	accessToken: string
}

export interface FacebookOAuth2User {
	providerUserId: string
	email: string
	fullname: string
	firstname?: string
	lastname?: string
	avatarUrl?: string
	username?: string
	provider: 'FACEBOOK'
	accessToken: string
}