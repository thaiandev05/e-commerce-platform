export const AUTH_CONSTANT = {
	TIME_LIFE_CACHE: 10 * 24 * 60 * 60, // 10h
	TIME_LIFE_SESSION: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
	TIME_LIFE_ACCESS_TOKEN: 1000 * 60 * 60, // 1h
	TIME_LIFE_REFRESH_TOKEN: 1000 * 24 * 60 * 60 * 7, // 7d (in milliseconds)
	CODE_EXPIRED: 15 * 60, // 15 minutes (in seconds)
	COOKIE_CONFIG: {
		SESSION: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const
		},
		REFRESH_TOKEN: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/'
		},
		ACCESS_TOKEN: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/'
		}
	}
}