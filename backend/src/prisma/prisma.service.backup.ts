import { faker } from '@faker-js/faker';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AccountType,
  AttributeType,
  Prisma,
  PrismaClient,
  ShopStatus,
  SkuStatus,
  SpuStatus,
  Status,
  UserFlag,
  UserRoleS,
  UserVisibility,
} from '../../prisma/generated/prisma';

// --- Helper functions ---
const unique = <T>(arr: T[]) => Array.from(new Set(arr));

const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
};

function generateSku() {
  const category = faker.commerce.department().slice(0, 3).toUpperCase();
  const product = faker.commerce.product().slice(0, 3).toUpperCase();
  const number = faker.number.int({ min: 1000, max: 9999 });
  return `${category}-${product}-${number}`;
}

const generateProductImages = (count = 5): string[] => {
  return Array.from({ length: count }, () =>
    faker.image.urlPicsumPhotos({ width: 400, height: 300 }).slice(0, 500),
  );
};

// --- Generate IDs ---
const userIds = unique(Array.from({ length: 50 }, () => faker.string.uuid()));
const categoryIds = unique(
  Array.from({ length: 10 }, () => faker.string.uuid()),
);
const brandIds = unique(Array.from({ length: 15 }, () => faker.string.uuid()));
const shopIds = unique(Array.from({ length: 20 }, () => faker.string.uuid()));
const spuIds = unique(Array.from({ length: 100 }, () => faker.string.uuid()));
const skuIds = unique(Array.from({ length: 300 }, () => faker.string.uuid()));
const tagIds = unique(Array.from({ length: 30 }, () => faker.string.uuid()));
const attributeIds = unique(
  Array.from({ length: 20 }, () => faker.string.uuid()),
);
const attributeValueIds = unique(
  Array.from({ length: 100 }, () => faker.string.uuid()),
);

// --- Generate seed data ---
const users: Prisma.UserCreateManyInput[] = userIds.map((id, i) => ({
  id,
  fullname: faker.person.fullName().slice(0, 50),
  username: `user${i}_${faker.internet.username()}`.slice(0, 50),
  email: `user${i}_${faker.internet.email()}`.slice(0, 255),
  phone: faker.phone.number().slice(0, 20),
  hashingPassword: faker.internet.password(),
  accountType: faker.helpers.arrayElement(Object.values(AccountType)),
  avatarUrl: faker.image.avatar().slice(0, 500),
  address: faker.location.streetAddress().slice(0, 500),
  city: faker.location.city().slice(0, 50),
  state: faker.location.state().slice(0, 50),
  roles: [faker.helpers.arrayElement(Object.values(UserRoleS))],
  flags: [faker.helpers.arrayElement(Object.values(UserFlag))],
  searchCount: faker.number.int({ min: 0, max: 100 }),
  visible: faker.helpers.arrayElement(Object.values(UserVisibility)),
  status: faker.helpers.arrayElement(Object.values(Status)),
  isBanned: faker.datatype.boolean(0.1),
  isLocked: faker.datatype.boolean(0.05),
  isVerified: faker.datatype.boolean(0.8),
  lastActived: faker.date.recent({ days: 30 }),
}));

const categories: Prisma.CategoryCreateManyInput[] = categoryIds.map(
  (id, index) => {
    const name = faker.commerce.department();
    return {
      id,
      name: name.slice(0, 100),
      slug: `${faker.helpers.slugify(name)}-${index}`.slice(0, 100),
      description: faker.commerce.productDescription(),
      imageUrl: faker.image.url().slice(0, 500),
      isActive: faker.datatype.boolean(0.9),
      sortOrder: faker.number.int({ min: 0, max: 100 }),
    };
  },
);

const brands: Prisma.BrandCreateManyInput[] = brandIds.map((id, index) => {
  const name = `${faker.company.name()}-${index}`;
  return {
    id,
    name: name.slice(0, 100),
    slug: `${faker.helpers.slugify(name)}-${index}`.slice(0, 100),
    description: faker.company.catchPhrase(),
    logoUrl: faker.image.url().slice(0, 500),
    websiteUrl: faker.internet.url().slice(0, 500),
    isActive: faker.datatype.boolean(0.9),
  };
});

const shops: Prisma.ShopCreateManyInput[] = shopIds.map((id, index) => {
  const name = faker.company.name();
  return {
    id,
    name: name.slice(0, 200),
    slug: `${faker.helpers.slugify(name)}-${index}`.slice(0, 200),
    description: faker.company.catchPhrase(),
    logoUrl: faker.image.url().slice(0, 500),
    bannerUrl: faker.image.url().slice(0, 500),
    email: faker.internet.email().slice(0, 255),
    phone: faker.phone.number().slice(0, 20),
    address: faker.location.streetAddress(),
    website: faker.internet.url().slice(0, 500),
    status: faker.helpers.arrayElement(Object.values(ShopStatus)),
    isActive: faker.datatype.boolean(0.9),
    isVerified: faker.datatype.boolean(0.7),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 2 }),
    totalReviews: faker.number.int({ min: 0, max: 1000 }),
    ownerId: faker.helpers.arrayElement(userIds),
  };
});

const tags: Prisma.TagCreateManyInput[] = tagIds.map((id, index) => {
  const name = `${faker.commerce.productAdjective()}-${index}`;
  return {
    id,
    name: name.slice(0, 50),
    slug: `${faker.helpers.slugify(name)}-${index}`.slice(0, 50),
    color: faker.color.rgb(),
    isActive: faker.datatype.boolean(0.9),
  };
});

const attributes: Prisma.AttributeCreateManyInput[] = attributeIds.map(
  (id, index) => {
    const name = `${faker.commerce.productMaterial()}-${index}`;
    return {
      id,
      name: name.slice(0, 100),
      displayName: name.slice(0, 100),
      type: faker.helpers.arrayElement(Object.values(AttributeType)),
      isRequired: faker.datatype.boolean(0.3),
      isVariation: faker.datatype.boolean(0.5),
      sortOrder: faker.number.int({ min: 0, max: 100 }),
      isActive: faker.datatype.boolean(0.9),
    };
  },
);

const attributeValues: Prisma.AttributeValueCreateManyInput[] =
  attributeValueIds.map((id) => {
    const value = faker.commerce.productName();
    return {
      id,
      value: value.slice(0, 200),
      displayName: value.slice(0, 200),
      colorCode: faker.color.rgb(),
      imageUrl: faker.image.url().slice(0, 500),
      sortOrder: faker.number.int({ min: 0, max: 100 }),
      isActive: faker.datatype.boolean(0.9),
      attributeId: faker.helpers.arrayElement(attributeIds),
    };
  });

const spus: Prisma.SpuCreateManyInput[] = spuIds.map((id, index) => {
  const name = faker.commerce.productName();
  return {
    id,
    name: name.slice(0, 200),
    slug: `${faker.helpers.slugify(name)}-${index}`.slice(0, 200),
    description: faker.commerce.productDescription(),
    shortDesc: faker.lorem.sentence().slice(0, 500),
    status: faker.helpers.arrayElement(Object.values(SpuStatus)),
    isActive: faker.datatype.boolean(0.9),
    categoryId: faker.helpers.arrayElement(categoryIds),
    brandId: faker.helpers.arrayElement(brandIds),
    shopId: faker.helpers.arrayElement(shopIds),
  };
});

const skus: Prisma.SkuCreateManyInput[] = skuIds.map((id) => {
  const originalPrice = faker.number.float({
    min: 10,
    max: 1000,
    fractionDigits: 2,
  });
  const salePrice = faker.number.float({
    min: originalPrice * 0.5,
    max: originalPrice * 0.9,
    fractionDigits: 2,
  });

  return {
    id,
    skuCode: generateSku(),
    name: faker.commerce.productName().slice(0, 200),
    originalPrice,
    salePrice: faker.datatype.boolean(0.7) ? salePrice : null,
    stock: faker.number.int({ min: 0, max: 1000 }),
    weight: faker.number.float({ min: 0.1, max: 10.0, fractionDigits: 2 }),
    length: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
    width: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
    height: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
    status: faker.helpers.arrayElement(Object.values(SkuStatus)),
    isActive: faker.datatype.boolean(0.9),
    spuId: faker.helpers.arrayElement(spuIds),
  };
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      omit: { user: { hashingPassword: true } },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      // Clear existing data in correct order (respecting foreign key constraints)
      await this.skuVariationValue.deleteMany();
      await this.spuVariation.deleteMany();
      await this.skuAttribute.deleteMany();
      await this.spuAttribute.deleteMany();
      await this.spuTag.deleteMany();
      await this.skuImage.deleteMany();
      await this.spuImage.deleteMany();
      await this.sku.deleteMany();
      await this.spu.deleteMany();
      await this.attributeValue.deleteMany();
      await this.attribute.deleteMany();
      await this.tag.deleteMany();
      await this.shop.deleteMany();
      await this.brand.deleteMany();
      await this.category.deleteMany();
      await this.creditCard.deleteMany();
      await this.oauth2User.deleteMany();
      await this.session.deleteMany();
      await this.code.deleteMany();
      await this.user.deleteMany();

      console.log('🗑️  Cleared existing data');

      // Seed data in correct order
      console.log('👥 Seeding users...');
      await this.user.createMany({ data: users });

      console.log('🏪 Seeding categories...');
      await this.category.createMany({ data: categories });

      console.log('🏢 Seeding brands...');
      await this.brand.createMany({ data: brands });

      console.log('🛍️  Seeding shops...');
      await this.shop.createMany({ data: shops });

      console.log('🏷️  Seeding tags...');
      await this.tag.createMany({ data: tags });

      console.log('🔧 Seeding attributes...');
      await this.attribute.createMany({ data: attributes });

      console.log('📋 Seeding attribute values...');
      await this.attributeValue.createMany({ data: attributeValues });

      console.log('📦 Seeding SPUs...');
      await this.spu.createMany({ data: spus });

      console.log('📊 Seeding SKUs...');
      await this.sku.createMany({ data: skus });

      // Generate and seed images for SPUs and SKUs
      console.log('🖼️  Seeding product images...');

      const spuImages: Prisma.SpuImageCreateManyInput[] = [];
      for (const spu of spus) {
        const imageCount = faker.number.int({ min: 1, max: 5 });
        for (let i = 0; i < imageCount; i++) {
          spuImages.push({
            id: faker.string.uuid(),
            imageUrl: faker.image
              .urlPicsumPhotos({ width: 800, height: 600 })
              .slice(0, 500),
            altText: `${spu.name} image ${i + 1}`,
            sortOrder: i,
            isMain: i === 0,
            spuId: spu.id!,
          });
        }
      }

      const skuImages: Prisma.SkuImageCreateManyInput[] = [];
      for (const sku of skus) {
        const imageCount = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < imageCount; i++) {
          skuImages.push({
            id: faker.string.uuid(),
            imageUrl: faker.image
              .urlPicsumPhotos({ width: 600, height: 600 })
              .slice(0, 500),
            altText: `${sku.name} image ${i + 1}`,
            sortOrder: i,
            isMain: i === 0,
            skuId: sku.id!,
          });
        }
      }

      // Insert images in chunks to avoid memory issues
      for (const imageChunk of chunk(spuImages, 500)) {
        await this.spuImage.createMany({ data: imageChunk });
      }

      for (const imageChunk of chunk(skuImages, 500)) {
        await this.skuImage.createMany({ data: imageChunk });
      }

      console.log('✅ Database seeding completed successfully!');
      console.log(
        `📊 Seeded: ${users.length} users, ${categories.length} categories, ${brands.length} brands, ${shops.length} shops, ${spus.length} SPUs, ${skus.length} SKUs`,
      );

      // Emit events to sync data to Elasticsearch
      await this.syncDataToElasticsearchViaEvents();
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Sync seeded data to Elasticsearch by emitting events
   * This leverages the existing event system used by ProductService
   */
  private async syncDataToElasticsearchViaEvents(): Promise<void> {
    console.log('🔍 Starting Elasticsearch sync via events...');

    try {
      // Emit events for categories
      const categories = await this.category.findMany({
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      console.log(`📁 Emitting events for ${categories.length} categories...`);
      for (const category of categories) {
        const fullCategory = await this.category.findUnique({
          where: { id: category.id },
        });
        if (fullCategory) {
          this.eventEmitter.emit('category.created', fullCategory);
        }
      }

      // Emit events for brands
      const brands = await this.brand.findMany({
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      console.log(`🏢 Emitting events for ${brands.length} brands...`);
      for (const brand of brands) {
        const fullBrand = await this.brand.findUnique({
          where: { id: brand.id },
        });
        if (fullBrand) {
          this.eventEmitter.emit('brand.created', fullBrand);
        }
      }

      // Emit events for shops
      const shops = await this.shop.findMany({
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      console.log(`🏪 Emitting events for ${shops.length} shops...`);
      for (const shop of shops) {
        const fullShop = await this.shop.findUnique({
          where: { id: shop.id },
        });
        if (fullShop) {
          this.eventEmitter.emit('shop.created', fullShop);
        }
      }

      // Get all SPUs to emit product.created events
      const spus = await this.spu.findMany({
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      console.log(`📦 Emitting events for ${spus.length} products...`);

      // Emit events in batches to avoid overwhelming the system
      const batchSize = 10;
      let processedCount = 0;

      for (let i = 0; i < spus.length; i += batchSize) {
        const batch = spus.slice(i, i + batchSize);

        // Process batch in parallel
        await Promise.all(
          batch.map(async (spu) => {
            try {
              // Get full SPU data for the event
              const fullSpu = await this.spu.findUnique({
                where: { id: spu.id },
              });

              if (fullSpu) {
                // Emit the same event that ProductService uses
                this.eventEmitter.emit('product.created', {
                  req: { user: { id: 'seed-system' } },
                  newSpu: fullSpu,
                });
                processedCount++;
              }
            } catch (error) {
              this.logger.error(
                `Failed to emit event for SPU ${spu.id}:`,
                error,
              );
            }
          }),
        );

        // Add small delay between batches
        if (i + batchSize < spus.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `✅ Emitted events for ${processedCount}/${spus.length} products`,
      );
      console.log('🎉 Elasticsearch sync via events completed!');
    } catch (error) {
      this.logger.error('Failed to sync data via events:', error);
      console.log(
        '⚠️ Elasticsearch sync failed, but database seeding was successful',
      );
    }
  }

  /**
   * Seed with automatic Elasticsearch sync via events
   * This is the recommended method for production seeding
   */
  async seedWithElasticsearchSync(): Promise<void> {
    await this.seed();
  }
}
