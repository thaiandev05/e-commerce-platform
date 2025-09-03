import { PrismaService } from "@/prisma/prisma.service";
import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException
} from "@nestjs/common";
import { User } from "@prisma/generated/prisma";

@Injectable()
export class IsAuthorShopGuard implements CanActivate {

	constructor(
		private readonly prismaService: PrismaService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			// Get request context
			const request = context.switchToHttp().getRequest();
			const user: User = request.user;
			const shopId: string = request.query?.shopId || request.params?.shopId;

			// Validate required data
			if (!user?.id) {
				throw new BadRequestException("User authentication required");
			}

			if (!shopId) {
				throw new BadRequestException("Shop ID is required in query or params");
			}

			// Validate UUID format
			if (!this.isValidUUID(shopId)) {
				throw new BadRequestException("Invalid shop ID format");
			}

			// Check if shop exists and user is the owner in a single query
			const shop = await this.prismaService.shop.findUnique({
				where: {
					id: shopId,
					ownerId: user.id // This ensures both existence and ownership
				},
				select: {
					id: true,
					ownerId: true,
					isActive: true,
					status: true
				}
			});

			if (!shop) {
				// Check if shop exists at all to provide better error message
				const shopExists = await this.prismaService.shop.findUnique({
					where: { id: shopId },
					select: { id: true }
				});

				if (!shopExists) {
					throw new NotFoundException("Shop not found");
				} else {
					throw new ForbiddenException("You are not authorized to access this shop");
				}
			}

			// Optional: Check if shop is active
			if (!shop.isActive) {
				throw new ForbiddenException("Shop is not active");
			}

			// Optional: Check shop status
			if (shop.status === 'SUSPENDED' || shop.status === 'CLOSED') {
				throw new ForbiddenException(`Shop is ${shop.status.toLowerCase()}`);
			}

			return true;

		} catch (error) {
			// Re-throw known exceptions
			if (error instanceof BadRequestException ||
				error instanceof NotFoundException ||
				error instanceof ForbiddenException) {
				throw error;
			}

			// Handle unexpected errors
			throw new BadRequestException("Failed to verify shop authorization");
		}
	}

	/**
	 * Validate UUID format
	 */
	private isValidUUID(uuid: string): boolean {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(uuid);
	}

}