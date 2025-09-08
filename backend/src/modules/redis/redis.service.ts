import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CONSTANTS } from './redis.constants';

@Injectable()
export class RedisService {

	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) { }

	// get many account have name or username like something client import
	public async getManyAccountLike(name: string) {
		const key = REDIS_CONSTANTS.ACCOUNT_LIKE_NAME_KEY(name)
		const cached = await this.cacheManager.get(key)
		return cached
	}

	// save user data in cache
	public async saveUserData(key: string, data: any) {
		return await this.cacheManager.set(key, data, REDIS_CONSTANTS.TIME_FILE_CACHE.CACHE_LARGE_DATA)
	}
}
