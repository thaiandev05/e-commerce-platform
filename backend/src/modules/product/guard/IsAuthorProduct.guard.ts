import { PrismaService } from '@/prisma/prisma.service';
import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/generated/prisma';
import { userInfo } from 'os';

@Injectable()
export class IsAuthorProductGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const productId: string =
      request.query?.productId || request.params?.productId;

    // validate data
    if (!user || !productId) {
      console.log('Guard validation failed:', {
        hasUser: !!user,
        hasProductId: !!productId,
      });
      throw new BadGatewayException('Information not enough');
    }

    // find available product with shop info
    const availableProduct = await this.prismaService.spu.findUnique({
      where: { id: productId },
      include: {
        shop: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!availableProduct) {
      console.log('Product not found:', productId);
      throw new NotFoundException('Product not found');
    }

    // Check if user is the owner of the shop that owns this product
    const isOwner = availableProduct.shop.ownerId === user.id;

    console.log('Authorization check:', {
      userId: user.id,
      productId,
      shopOwnerId: availableProduct.shop.ownerId,
      isOwner,
    });

    return isOwner;
  }
}
