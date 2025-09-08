export const REDIS_CONSTANTS = {
	ACCOUNTS_LIKE_NAME_KEY: (mainkey: string) => `accountLikeName:${mainkey}`,
	SHOPS_LIKE_NAME_LEY: (mainkey: string) => `shopsLikeName:${mainkey}`,
	TIME_FILE_CACHE: {
		CACHE_LARGE_DATA: 30
	}
}