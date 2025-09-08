import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { SearchUserLikeNameDto } from "../dto/search-user-like-name.dto";
import { RedisService } from "@/modules/redis/redis.service";
import { REDIS_CONSTANTS } from "@/modules/redis/redis.constants";

@Injectable()
export class UserSearchService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) { }

	// search user like name
	async searchUserLikeName(name: string, dto: SearchUserLikeNameDto) {
		// validate input
		if (!name || name.trim() === '') {
			return {
				success: true,
				data: {
					accountLikeName: [],
					pagination: dto?.useCursor ?
						{
							limit: dto?.take || 10,
							hasNext: false,
							nextCursor: null,
							cursor: dto?.cursor
						} :
						{
							page: dto?.page || 1,
							limit: dto?.limit || 10,
							total: 0,
							hasNext: false,
							hasPrev: false
						}
				}
			}
		}

		// validate dto parameter
		if (!dto) {
			dto = {} as SearchUserLikeNameDto;
		}

		// checking available in cache
		const cached = await this.redisService.getManyAccountLike(name)
		if (cached) return cached

		// build shop inlcude options 	
		let userInclude: any = {
			status: "ACTIVE"
		}

		if (dto?.includeDeleted) {
			userInclude = {}
		}

		const queryOptions: any = {
			where: {
				OR: [
					{
						fullname: {
							contains: name,
							mode: "insensitive"
						}
					},
					{
						username: {
							contains: name,
							mode: "insensitive"
						}
					}
				],
				...userInclude
			},
			orderBy: { [dto?.sortBy || 'createdAt']: dto?.sortOrder || "desc" },
			take: (dto?.take || 10) + 1
		}

		// use pagination 
		if (dto?.useCursor && dto?.cursor) {
			queryOptions.cursor = { id: dto.cursor }
			queryOptions.skip = 1
		} else if (dto?.page) {
			queryOptions.skip = dto?.skip
			queryOptions.take = dto?.take || 10
		}

		// find 
		const accountLikeName = await this.prismaService.user.findMany(queryOptions)

		// check if has more
		const hasMore = accountLikeName.length > (dto?.take || 10)
		if (hasMore) accountLikeName.pop()

		// calculator nest cursor
		const nextCursor = hasMore && accountLikeName.length > 0 ? accountLikeName[accountLikeName.length - 1].id : null

		let totalAccount: number | undefined

		const queryOptionsCount: any = {
			OR: [
				{
					fullname: {
						contains: name,
						mode: "insensitive"
					}
				},
				{
					username: {
						contains: name,
						mode: "insensitive"
					}
				}
			],
		}

		if (!dto?.includeDeleted) {
			queryOptionsCount.status = "ACTIVE"
		}

		if (dto?.page && !dto?.useCursor && !dto?.includeDeleted) {
			totalAccount = await this.prismaService.user.count({
				where: queryOptionsCount
			})
		}

		// save data in cache
		const key = REDIS_CONSTANTS.ACCOUNT_LIKE_NAME_KEY(name)
		await this.redisService.saveUserData(key, accountLikeName)

		return {
			success: true,
			data: {
				accountLikeName,
				pagination: dto?.useCursor ?
					{
						limit: dto?.take || 10,
						hasNext: hasMore,
						nextCursor,
						cursor: dto?.cursor
					} :
					{
						page: dto?.page || 1,
						limit: dto?.limit || 10,
						total: totalAccount!,
						hasNext: hasMore,
						hasPrev: (dto?.page || 1) > 1
					}
			}
		}
	}
}