import { faker } from '@faker-js/faker';
import {
	AccountType,
	AttributeType,
	Prisma,
	ShopStatus,
	SkuStatus,
	SpuStatus,
	Status,
	UserFlag,
	UserVisibility,
	Provider,
	TypeOfPayment,
	StatusOrder
} from '../../prisma/generated/prisma';

// --- Helper functions ---
export const unique = <T>(arr: T[]) => Array.from(new Set(arr));

export const chunk = <T>(array: T[], size: number): T[][] => {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
		array.slice(i * size, i * size + size)
	);
};

const usedSkuCodes = new Set<string>();

export function generateSku(): string {
	let skuCode: string;
	let attempts = 0;
	const maxAttempts = 100;

	do {
		const category = faker.commerce.department().slice(0, 3).toUpperCase();
		const product = faker.commerce.product().slice(0, 3).toUpperCase();
		const number = faker.number.int({ min: 1000, max: 9999 });
		skuCode = `${category}-${product}-${number}`;
		attempts++;

		if (attempts > maxAttempts) {
			// Fallback to timestamp-based SKU if we can't generate unique one
			skuCode = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
			break;
		}
	} while (usedSkuCodes.has(skuCode));

	usedSkuCodes.add(skuCode);
	return skuCode;
}

export function generateSlug(name: string, index?: number): string {
	const slug = faker.helpers.slugify(name.toLowerCase());
	return index !== undefined ? `${slug}-${index}` : slug;
}

// Vietnamese realistic data
const vietnameseCategories = [
	'Thời trang nam', 'Thời trang nữ', 'Giày dép', 'Túi xách', 'Đồng hồ',
	'Điện thoại', 'Laptop', 'Máy tính bảng', 'Âm thanh', 'Camera',
	'Trang sức', 'Mỹ phẩm', 'Chăm sóc da', 'Nước hoa', 'Dụng cụ làm đẹp',
	'Đồ gia dụng', 'Nội thất', 'Đèn trang trí', 'Chăn ga gối', 'Bếp và phòng ăn',
	'Sách', 'Văn phòng phẩm', 'Đồ chơi', 'Thể thao', 'Du lịch'
];

const vietnameseBrands = [
	'Saigon Tech', 'Hanoi Fashion', 'Mekong Electronics', 'Viet Beauty', 'Golden Dragon',
	'Lotus Style', 'Bamboo Home', 'Phoenix Wings', 'Ocean Blue', 'Mountain View',
	'Urban Chic', 'Royal Palace', 'Diamond Star', 'Silver Moon', 'Emerald Green'
];

const vietnameseShops = [
	'Cửa hàng thời trang Sài Gòn', 'Shop công nghệ Hà Nội', 'Siêu thị điện máy Miền Nam',
	'Cửa hàng mỹ phẩm cao cấp', 'Shop giày dép thời trang', 'Cửa hàng đồ gia dụng',
	'Shop nội thất hiện đại', 'Cửa hàng sách văn phòng phẩm', 'Shop thể thao outdoor',
	'Cửa hàng trang sức vàng bạc', 'Shop đồng hồ chính hãng', 'Siêu thị thực phẩm sạch'
];

const vietnameseProducts = [
	'Áo sơ mi trắng công sở', 'Quần jeans slim fit', 'Giày sneaker thể thao',
	'Túi xách da thật cao cấp', 'Đồng hồ thông minh', 'Điện thoại smartphone',
	'Laptop gaming cao cấp', 'Tai nghe bluetooth', 'Kem dưỡng da mặt',
	'Nước hoa nam nữ', 'Bàn làm việc gỗ tự nhiên', 'Đèn bàn LED'
];

// --- Generate consistent IDs ---
export const roleIds = unique([
	faker.string.uuid(), // ROOT
	faker.string.uuid(), // ADMINISTRATOR
	faker.string.uuid(), // SUPPORTER
	faker.string.uuid(), // SELLER
	faker.string.uuid()  // USER
]); export const permissionIds = unique(Array.from({ length: 20 }, (_, i) => i + 1));
export const userIds = unique(Array.from({ length: 50 }, () => faker.string.uuid()));
export const categoryIds = unique(Array.from({ length: vietnameseCategories.length }, () => faker.string.uuid()));
export const brandIds = unique(Array.from({ length: vietnameseBrands.length }, () => faker.string.uuid()));
export const shopIds = unique(Array.from({ length: vietnameseShops.length }, () => faker.string.uuid()));
export const spuIds = unique(Array.from({ length: 100 }, () => faker.string.uuid()));
export const skuIds = unique(Array.from({ length: 300 }, () => faker.string.uuid()));
export const tagIds = unique(Array.from({ length: 30 }, () => faker.string.uuid()));
export const attributeIds = unique(Array.from({ length: 15 }, () => faker.string.uuid()));
export const attributeValueIds = unique(Array.from({ length: 60 }, () => faker.string.uuid()));
export const cartIds = unique(Array.from({ length: 30 }, () => faker.string.uuid()));
export const orderIds = unique(Array.from({ length: 50 }, () => faker.string.uuid()));
export const voucherIds = unique(Array.from({ length: 20 }, () => faker.string.uuid()));
export const spuImageIds = unique(Array.from({ length: 200 }, () => faker.string.uuid()));
export const skuImageIds = unique(Array.from({ length: 400 }, () => faker.string.uuid()));

// --- Generate Roles & Permissions ---
export const roles: Prisma.RoleCreateManyInput[] = [
	{
		id: roleIds[0],
		roleName: 'ROOT',
	},
	{
		id: roleIds[1],
		roleName: 'ADMINISTRATOR',
	},
	{
		id: roleIds[2],
		roleName: 'SUPPORTER',
	},
	{
		id: roleIds[3],
		roleName: 'SELLER',
	},
	{
		id: roleIds[4],
		roleName: 'USER',
	}
];

export const permissions: Prisma.PermissionCreateManyInput[] = [
	{ permissionName: 'manage_users' },
	{ permissionName: 'manage_products' },
	{ permissionName: 'manage_shops' },
	{ permissionName: 'manage_orders' },
	{ permissionName: 'view_analytics' },
	{ permissionName: 'manage_categories' },
	{ permissionName: 'manage_brands' },
	{ permissionName: 'moderate_reviews' },
	{ permissionName: 'handle_support' },
	{ permissionName: 'create_product' },
	{ permissionName: 'edit_product' },
	{ permissionName: 'delete_product' },
	{ permissionName: 'manage_inventory' },
	{ permissionName: 'view_shop_analytics' },
	{ permissionName: 'manage_shop_settings' },
	{ permissionName: 'create_shop' },
	{ permissionName: 'view_profile' },
	{ permissionName: 'edit_profile' },
	{ permissionName: 'place_order' },
	{ permissionName: 'write_review' }
];

// Role-Permission mappings
// NOTE: RolePermission schema has an issue - it has Permission[] relationship instead of permissionId
// This needs to be fixed in the schema first. For now, we'll skip RolePermission seeding.
// 
// SCHEMA FIX NEEDED:
// model RolePermission {
//     id           String     @id @default(uuid()) @db.Uuid
//     roleId       String     @map("role_id") @db.Uuid
//     permissionId Int        @map("permission_id") // ADD THIS
//     createdAt    DateTime   @default(now()) @map("created_at") @db.Timestamptz()
//
//     role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
//     permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade) // CHANGE THIS
//
//     @@unique([roleId, permissionId]) // ADD THIS
//     @@index([roleId])
//     @@index([permissionId]) // ADD THIS
//     @@map("role_permissions")
// }

export const rolePermissions: Prisma.RolePermissionCreateManyInput[] = [
	// ROOT role - all permissions (1-20)
	...Array.from({ length: 20 }, (_, i) => ({
		id: faker.string.uuid(),
		roleId: roleIds[0], // ROOT
		permissionId: i + 1
	})),

	// ADMINISTRATOR role - most permissions (1-15)
	...Array.from({ length: 15 }, (_, i) => ({
		id: faker.string.uuid(),
		roleId: roleIds[1], // ADMINISTRATOR
		permissionId: i + 1
	})),

	// SUPPORTER role - support related permissions (8-9)
	{ id: faker.string.uuid(), roleId: roleIds[2], permissionId: 8 }, // moderate_reviews
	{ id: faker.string.uuid(), roleId: roleIds[2], permissionId: 9 }, // handle_support

	// SELLER role - shop and product management (10-16)
	...Array.from({ length: 7 }, (_, i) => ({
		id: faker.string.uuid(),
		roleId: roleIds[3], // SELLER
		permissionId: i + 10 // permissions 10-16
	})),

	// USER role - basic permissions (17-20)
	...Array.from({ length: 4 }, (_, i) => ({
		id: faker.string.uuid(),
		roleId: roleIds[4], // USER
		permissionId: i + 17 // permissions 17-20
	}))
];

// --- Generate Users ---
export const users: Prisma.UserCreateManyInput[] = userIds.map((id, i) => {
	// Create some specific users with known roles
	if (i === 0) {
		return {
			id,
			fullname: 'Super Admin',
			username: 'root',
			email: 'root@admin.com',
			phone: '0901234567',
			hashingPassword: '$2b$10$examplehashedpassword', // In real app, hash properly
			accountType: AccountType.EMAIL,
			avatarUrl: faker.image.avatar().slice(0, 500),
			address: 'Hồ Chí Minh City',
			city: 'Hồ Chí Minh',
			state: 'Hồ Chí Minh',
			visible: UserVisibility.PRIVATE,
			status: Status.ACTIVE,
			isVerified: true,
			lastActived: new Date(),
		};
	}

	if (i < 5) {
		// Create some admin users
		return {
			id,
			fullname: faker.person.fullName(),
			username: `admin${i}`,
			email: `admin${i}@company.com`,
			phone: faker.phone.number().slice(0, 20),
			hashingPassword: '$2b$10$examplehashedpassword',
			accountType: AccountType.EMAIL,
			avatarUrl: faker.image.avatar().slice(0, 500),
			address: faker.location.streetAddress().slice(0, 500),
			city: faker.location.city().slice(0, 50),
			state: faker.location.state().slice(0, 50),
			visible: UserVisibility.PUBLIC,
			status: Status.ACTIVE,
			isVerified: true,
			lastActived: faker.date.recent({ days: 7 }),
		};
	}

	if (i < 15) {
		// Create seller users
		return {
			id,
			fullname: faker.person.fullName(),
			username: `seller${i}`,
			email: `seller${i}@shop.com`,
			phone: faker.phone.number().slice(0, 20),
			hashingPassword: '$2b$10$examplehashedpassword',
			accountType: AccountType.EMAIL,
			avatarUrl: faker.image.avatar().slice(0, 500),
			address: faker.location.streetAddress().slice(0, 500),
			city: faker.location.city().slice(0, 50),
			state: faker.location.state().slice(0, 50),
			visible: UserVisibility.PUBLIC,
			status: Status.ACTIVE,
			isVerified: faker.datatype.boolean(0.8),
			lastActived: faker.date.recent({ days: 30 }),
		};
	}

	// Regular users
	return {
		id,
		fullname: faker.person.fullName(),
		username: `user${i}_${faker.internet.username()}`.slice(0, 50),
		email: faker.internet.email().slice(0, 255),
		phone: faker.phone.number().slice(0, 20),
		hashingPassword: '$2b$10$examplehashedpassword',
		accountType: faker.helpers.arrayElement(Object.values(AccountType)),
		avatarUrl: faker.image.avatar().slice(0, 500),
		address: faker.location.streetAddress().slice(0, 500),
		city: faker.location.city().slice(0, 50),
		state: faker.location.state().slice(0, 50),
		visible: faker.helpers.arrayElement(Object.values(UserVisibility)),
		status: faker.helpers.arrayElement(Object.values(Status)),
		isBanned: faker.datatype.boolean(0.02),
		isLocked: faker.datatype.boolean(0.01),
		isVerified: faker.datatype.boolean(0.7),
		lastActived: faker.date.recent({ days: 90 }),
	};
});

// User-Role assignments
export const userRoles: Prisma.UserRoleCreateManyInput[] = [
	// Assign ROOT role to first user
	{
		id: faker.string.uuid(),
		userId: userIds[0],
		roleId: roleIds[0], // ROOT
	},
	// Assign ADMINISTRATOR roles to admin users
	...userIds.slice(1, 5).map(userId => ({
		id: faker.string.uuid(),
		userId,
		roleId: roleIds[1], // ADMINISTRATOR
	})),
	// Assign SELLER roles to seller users
	...userIds.slice(5, 15).map(userId => ({
		id: faker.string.uuid(),
		userId,
		roleId: roleIds[3], // SELLER
	})),
	// Assign USER roles to remaining users
	...userIds.slice(15).map(userId => ({
		id: faker.string.uuid(),
		userId,
		roleId: roleIds[4], // USER
	}))
];

// --- Generate Categories ---
export const categories: Prisma.CategoryCreateManyInput[] = categoryIds.map((id, index) => ({
	id,
	name: vietnameseCategories[index],
	slug: generateSlug(vietnameseCategories[index], index),
	description: `Danh mục ${vietnameseCategories[index]} - Tuyển chọn sản phẩm chất lượng cao`,
	imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 300 }).slice(0, 500),
	isActive: index < 20, // First 20 categories are active
	sortOrder: index + 1,
}));

// --- Generate Brands ---
export const brands: Prisma.BrandCreateManyInput[] = brandIds.map((id, index) => ({
	id,
	name: vietnameseBrands[index],
	slug: generateSlug(vietnameseBrands[index], index),
	description: `${vietnameseBrands[index]} - Thương hiệu uy tín hàng đầu Việt Nam`,
	logoUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }).slice(0, 500),
	websiteUrl: faker.internet.url().slice(0, 500),
	isActive: faker.datatype.boolean(0.95),
}));

// --- Generate Shops ---
export const shops: Prisma.ShopCreateManyInput[] = shopIds.map((id, index) => ({
	id,
	name: vietnameseShops[index],
	slug: generateSlug(vietnameseShops[index], index),
	description: `${vietnameseShops[index]} - Cửa hàng uy tín, sản phẩm chất lượng, giá cả hợp lý`,
	logoUrl: faker.image.urlPicsumPhotos({ width: 300, height: 300 }).slice(0, 500),
	bannerUrl: faker.image.urlPicsumPhotos({ width: 1200, height: 400 }).slice(0, 500),
	email: `shop${index}@store.vn`,
	phone: `090${faker.number.int({ min: 1000000, max: 9999999 })}`,
	address: faker.location.streetAddress(),
	website: faker.internet.url().slice(0, 500),
	status: faker.helpers.arrayElement(Object.values(ShopStatus)),
	isActive: faker.datatype.boolean(0.9),
	isVerified: faker.datatype.boolean(0.8),
	rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
	totalReviews: faker.number.int({ min: 10, max: 1000 }),
	ownerId: userIds[Math.min(5 + index, userIds.length - 1)], // Assign to seller users
}));

// --- Generate Tags ---
export const tags: Prisma.TagCreateManyInput[] = tagIds.map((id, index) => {
	const tagNames = [
		'hot', 'sale', 'new', 'trending', 'bestseller', 'limited', 'premium', 'eco-friendly',
		'handmade', 'vintage', 'modern', 'classic', 'luxury', 'budget', 'quality',
		'imported', 'local', 'organic', 'tech', 'fashion', 'home', 'beauty', 'sports',
		'books', 'kids', 'men', 'women', 'unisex', 'gift', 'seasonal'
	];

	return {
		id,
		name: tagNames[index] || `tag-${index}`,
		slug: generateSlug(tagNames[index] || `tag-${index}`, index),
		color: faker.color.rgb(),
		isActive: faker.datatype.boolean(0.9),
	};
});

// --- Generate Attributes ---
export const attributes: Prisma.AttributeCreateManyInput[] = [
	{
		id: attributeIds[0],
		name: 'color',
		displayName: 'Màu sắc',
		type: AttributeType.COLOR,
		isRequired: false,
		isVariation: true,
		sortOrder: 1,
		isActive: true,
	},
	{
		id: attributeIds[1],
		name: 'size',
		displayName: 'Kích thước',
		type: AttributeType.SELECT,
		isRequired: false,
		isVariation: true,
		sortOrder: 2,
		isActive: true,
	},
	{
		id: attributeIds[2],
		name: 'material',
		displayName: 'Chất liệu',
		type: AttributeType.TEXT,
		isRequired: false,
		isVariation: false,
		sortOrder: 3,
		isActive: true,
	},
	{
		id: attributeIds[3],
		name: 'brand',
		displayName: 'Thương hiệu',
		type: AttributeType.TEXT,
		isRequired: true,
		isVariation: false,
		sortOrder: 4,
		isActive: true,
	},
	{
		id: attributeIds[4],
		name: 'weight',
		displayName: 'Trọng lượng',
		type: AttributeType.NUMBER,
		isRequired: false,
		isVariation: false,
		sortOrder: 5,
		isActive: true,
	},
	{
		id: attributeIds[5],
		name: 'warranty',
		displayName: 'Bảo hành',
		type: AttributeType.TEXT,
		isRequired: false,
		isVariation: false,
		sortOrder: 6,
		isActive: true,
	},
	{
		id: attributeIds[6],
		name: 'origin',
		displayName: 'Xuất xứ',
		type: AttributeType.TEXT,
		isRequired: false,
		isVariation: false,
		sortOrder: 7,
		isActive: true,
	},
	{
		id: attributeIds[7],
		name: 'style',
		displayName: 'Phong cách',
		type: AttributeType.SELECT,
		isRequired: false,
		isVariation: true,
		sortOrder: 8,
		isActive: true,
	}
];

// --- Generate Attribute Values ---
export const attributeValues: Prisma.AttributeValueCreateManyInput[] = [
	// Colors
	{ id: attributeValueIds[0], value: 'red', displayName: 'Đỏ', colorCode: '#FF0000', attributeId: attributeIds[0], sortOrder: 1, isActive: true },
	{ id: attributeValueIds[1], value: 'blue', displayName: 'Xanh dương', colorCode: '#0000FF', attributeId: attributeIds[0], sortOrder: 2, isActive: true },
	{ id: attributeValueIds[2], value: 'green', displayName: 'Xanh lá', colorCode: '#008000', attributeId: attributeIds[0], sortOrder: 3, isActive: true },
	{ id: attributeValueIds[3], value: 'black', displayName: 'Đen', colorCode: '#000000', attributeId: attributeIds[0], sortOrder: 4, isActive: true },
	{ id: attributeValueIds[4], value: 'white', displayName: 'Trắng', colorCode: '#FFFFFF', attributeId: attributeIds[0], sortOrder: 5, isActive: true },
	{ id: attributeValueIds[5], value: 'yellow', displayName: 'Vàng', colorCode: '#FFFF00', attributeId: attributeIds[0], sortOrder: 6, isActive: true },
	{ id: attributeValueIds[6], value: 'pink', displayName: 'Hồng', colorCode: '#FFC0CB', attributeId: attributeIds[0], sortOrder: 7, isActive: true },
	{ id: attributeValueIds[7], value: 'gray', displayName: 'Xám', colorCode: '#808080', attributeId: attributeIds[0], sortOrder: 8, isActive: true },

	// Sizes
	{ id: attributeValueIds[8], value: 'XS', displayName: 'XS', attributeId: attributeIds[1], sortOrder: 1, isActive: true },
	{ id: attributeValueIds[9], value: 'S', displayName: 'S', attributeId: attributeIds[1], sortOrder: 2, isActive: true },
	{ id: attributeValueIds[10], value: 'M', displayName: 'M', attributeId: attributeIds[1], sortOrder: 3, isActive: true },
	{ id: attributeValueIds[11], value: 'L', displayName: 'L', attributeId: attributeIds[1], sortOrder: 4, isActive: true },
	{ id: attributeValueIds[12], value: 'XL', displayName: 'XL', attributeId: attributeIds[1], sortOrder: 5, isActive: true },
	{ id: attributeValueIds[13], value: 'XXL', displayName: 'XXL', attributeId: attributeIds[1], sortOrder: 6, isActive: true },

	// Materials
	{ id: attributeValueIds[14], value: 'cotton', displayName: 'Cotton', attributeId: attributeIds[2], sortOrder: 1, isActive: true },
	{ id: attributeValueIds[15], value: 'polyester', displayName: 'Polyester', attributeId: attributeIds[2], sortOrder: 2, isActive: true },
	{ id: attributeValueIds[16], value: 'silk', displayName: 'Lụa', attributeId: attributeIds[2], sortOrder: 3, isActive: true },
	{ id: attributeValueIds[17], value: 'leather', displayName: 'Da thật', attributeId: attributeIds[2], sortOrder: 4, isActive: true },
	{ id: attributeValueIds[18], value: 'denim', displayName: 'Denim', attributeId: attributeIds[2], sortOrder: 5, isActive: true },
	{ id: attributeValueIds[19], value: 'wool', displayName: 'Len', attributeId: attributeIds[2], sortOrder: 6, isActive: true },

	// Styles
	{ id: attributeValueIds[20], value: 'casual', displayName: 'Casual', attributeId: attributeIds[7], sortOrder: 1, isActive: true },
	{ id: attributeValueIds[21], value: 'formal', displayName: 'Formal', attributeId: attributeIds[7], sortOrder: 2, isActive: true },
	{ id: attributeValueIds[22], value: 'sport', displayName: 'Thể thao', attributeId: attributeIds[7], sortOrder: 3, isActive: true },
	{ id: attributeValueIds[23], value: 'vintage', displayName: 'Vintage', attributeId: attributeIds[7], sortOrder: 4, isActive: true },
	{ id: attributeValueIds[24], value: 'modern', displayName: 'Hiện đại', attributeId: attributeIds[7], sortOrder: 5, isActive: true },
];

// --- Generate SPUs ---
export const spus: Prisma.SpuCreateManyInput[] = spuIds.map((id, index) => {
	const productName = vietnameseProducts[index % vietnameseProducts.length];
	const variation = Math.floor(index / vietnameseProducts.length) + 1;
	const fullName = variation > 1 ? `${productName} ${variation}` : productName;

	return {
		id,
		name: fullName.slice(0, 200),
		slug: generateSlug(fullName, index),
		description: `${fullName} - Sản phẩm chất lượng cao, thiết kế đẹp mắt, phù hợp với xu hướng hiện đại. Được làm từ chất liệu cao cấp, bền đẹp và an toàn cho người sử dụng.`,
		shortDesc: `${fullName} chất lượng cao, giá cả phù hợp`.slice(0, 500),
		status: faker.helpers.arrayElement(Object.values(SpuStatus)),
		isActive: faker.datatype.boolean(0.95),
		timeAccess: faker.number.bigInt({ min: 0n, max: 1000n }),
		categoryId: faker.helpers.arrayElement(categoryIds),
		brandId: faker.helpers.arrayElement(brandIds),
		shopId: faker.helpers.arrayElement(shopIds),
	};
});

// --- Generate SKUs ---
export const skus: Prisma.SkuCreateManyInput[] = skuIds.map((id, index) => {
	const originalPrice = faker.number.float({ min: 50000, max: 5000000, fractionDigits: 0 });
	const discountPercent = faker.number.float({ min: 0.05, max: 0.4, fractionDigits: 2 });
	const salePrice = Math.round(originalPrice * (1 - discountPercent));

	return {
		id,
		skuCode: generateSku(),
		name: `${faker.commerce.productName()} - Phiên bản ${index + 1}`.slice(0, 200),
		originalPrice,
		salePrice: faker.datatype.boolean(0.7) ? salePrice : null,
		stock: faker.number.int({ min: 0, max: 500 }),
		weight: faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 2 }),
		length: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
		width: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
		height: faker.number.float({ min: 1, max: 30, fractionDigits: 1 }),
		timeAccess: faker.number.bigInt({ min: 0n, max: 100n }),
		quantity: faker.number.bigInt({ min: 1n, max: 1000n }),
		status: faker.helpers.arrayElement(Object.values(SkuStatus)),
		isActive: faker.datatype.boolean(0.9),
		spuId: faker.helpers.arrayElement(spuIds),
	};
});

// --- Generate OAuth2 Users ---
export const oauth2Users: Prisma.Oauth2UserCreateManyInput[] = userIds
	.slice(0, 20) // Only some users have OAuth2
	.filter(() => faker.datatype.boolean(0.3)) // 30% chance
	.map((userId, index) => ({
		id: faker.string.uuid(),
		provider: faker.helpers.arrayElement(Object.values(Provider)),
		providerUserId: faker.string.alphanumeric(10),
		email: `oauth2user${index}@${faker.internet.domainName()}`,
		phone: faker.phone.number().slice(0, 20),
		firstname: faker.person.firstName(),
		lastname: faker.person.lastName(),
		fullname: faker.person.fullName(),
		avatarUrl: faker.image.avatar().slice(0, 500),
		username: `oauth2_${faker.internet.username()}`.slice(0, 50),
		userId
	}));

// --- Generate Credit Cards ---
export const creditCards: Prisma.CreditCardCreateManyInput[] = userIds
	.slice(0, 30) // Only some users have credit cards
	.filter(() => faker.datatype.boolean(0.4)) // 40% chance
	.map(userId => ({
		id: faker.string.uuid(),
		creditNumber: faker.finance.creditCardNumber().slice(0, 100),
		expiredDate: faker.date.future({ years: 5 }),
		ccvSecure: faker.finance.creditCardCVV(),
		name: faker.person.fullName().slice(0, 255),
		address: faker.location.streetAddress().slice(0, 500),
		postalCode: faker.location.zipCode().slice(0, 20),
		userId
	}));

// --- Generate Sessions (recent login sessions) ---
export const sessions: Prisma.SessionCreateManyInput[] = userIds
	.slice(0, 25) // Only some users have recent sessions
	.filter(() => faker.datatype.boolean(0.6)) // 60% chance
	.map(userId => ({
		id: faker.string.uuid(),
		hashingRefreshToken: faker.string.alphanumeric(64),
		userAgent: faker.internet.userAgent().slice(0, 1000),
		userIp: faker.internet.ip().slice(0, 100),
		loginedAt: faker.date.recent({ days: 30 }),
		logoutedAt: faker.datatype.boolean(0.3) ? faker.date.recent({ days: 15 }) : null,
		userId
	}));

// --- Generate Verification Codes ---
export const codes: Prisma.CodeCreateManyInput[] = userIds
	.filter(() => faker.datatype.boolean(0.1)) // 10% have pending codes
	.map(userId => ({
		id: faker.string.uuid(),
		code: faker.string.numeric(6),
		expiredAt: faker.date.soon({ days: 1 }),
		userId
	}));

// Note: UserFlag is not a model but an enum used in User model, so we skip it

// --- Generate Carts ---
export const carts: Prisma.CartCreateManyInput[] = cartIds.map((id, index) => ({
	id,
	ownId: userIds[index % userIds.length], // Each user can have one cart
}));

// --- Generate Store Products (Cart Items) ---
export const storeProducts: Prisma.StoreProductCreateManyInput[] = cartIds
	.map(cartId => {
		const numItems = faker.number.int({ min: 1, max: 5 });
		return Array.from({ length: numItems }, () => ({
			id: faker.string.uuid(),
			cartId,
			productId: faker.helpers.arrayElement(skuIds)
		}));
	})
	.flat();

// --- Generate Vouchers ---
export const vouchers: Prisma.VoucherCreateManyInput[] = voucherIds.map(id => ({
	id,
	categoryId: faker.helpers.arrayElement(categoryIds),
	percentDisCount: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
	expiredAt: faker.date.future({ years: 1 }),
	ownId: faker.helpers.arrayElement(userIds.slice(5, 15)) // Sellers can create vouchers
}));

// --- Generate Orders ---
export const orders: Prisma.OrderCreateManyInput[] = orderIds.map(id => ({
	id,
	typeOfPayment: faker.helpers.arrayElement(Object.values(TypeOfPayment)),
	statusOrder: faker.helpers.arrayElement(Object.values(StatusOrder)),
	ownId: faker.helpers.arrayElement(userIds) // Assign a valid user ID
}));

// --- Generate Order Products ---
export const orderProducts: Prisma.OrderProductCreateManyInput[] = orderIds
	.map(orderId => {
		const numItems = faker.number.int({ min: 1, max: 4 });
		return Array.from({ length: numItems }, () => ({
			id: faker.string.uuid(),
			orderId,
			productId: faker.helpers.arrayElement(skuIds),
			shopId: faker.helpers.arrayElement(shopIds)
		}));
	})
	.flat();

// --- Generate Voucher Used ---
export const voucherUsed: Prisma.VoucherUsedCreateManyInput[] = voucherIds
	.filter(() => faker.datatype.boolean(0.4)) // 40% of vouchers are used
	.map(voucherId => ({
		id: faker.string.uuid(),
		voucherId,
		orderId: faker.helpers.arrayElement(orderIds)
	}));

// --- Generate SPU Images ---
export const spuImages: Prisma.SpuImageCreateManyInput[] = spuImageIds.map((id, index) => ({
	id,
	imageUrl: faker.image.urlPicsumPhotos({ width: 600, height: 600 }).slice(0, 500),
	altText: `SPU Image ${index + 1}`,
	sortOrder: index % 5,
	isMain: index % 5 === 0, // First image is main
	spuId: faker.helpers.arrayElement(spuIds)
}));

// --- Generate SKU Images ---
export const skuImages: Prisma.SkuImageCreateManyInput[] = skuImageIds.map((id, index) => ({
	id,
	imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }).slice(0, 500),
	altText: `SKU Image ${index + 1}`,
	sortOrder: index % 3,
	isMain: index % 3 === 0, // First image is main
	skuId: faker.helpers.arrayElement(skuIds)
}));

// --- Generate SPU Attributes ---
export const spuAttributes: Prisma.SpuAttributeCreateManyInput[] = (() => {
	const usedPairs = new Set<string>();
	const relationships: Prisma.SpuAttributeCreateManyInput[] = [];

	spuIds.forEach(spuId => {
		const numAttrs = Math.min(faker.number.int({ min: 2, max: 4 }), attributeIds.length);
		const selectedAttributes = faker.helpers.arrayElements(attributeIds, { min: numAttrs, max: numAttrs });

		selectedAttributes.forEach(attributeId => {
			const pairKey = `${spuId}-${attributeId}`;
			if (!usedPairs.has(pairKey)) {
				usedPairs.add(pairKey);
				relationships.push({
					id: faker.string.uuid(),
					spuId,
					attributeId,
					attributeValueId: faker.helpers.arrayElement(attributeValueIds)
				});
			}
		});
	});

	return relationships;
})();

// --- Generate SKU Attributes ---
export const skuAttributes: Prisma.SkuAttributeCreateManyInput[] = (() => {
	const usedPairs = new Set<string>();
	const relationships: Prisma.SkuAttributeCreateManyInput[] = [];

	skuIds.forEach(skuId => {
		const numAttrs = Math.min(faker.number.int({ min: 1, max: 2 }), attributeIds.length);
		const selectedAttributes = faker.helpers.arrayElements(attributeIds, { min: numAttrs, max: numAttrs });

		selectedAttributes.forEach(attributeId => {
			const pairKey = `${skuId}-${attributeId}`;
			if (!usedPairs.has(pairKey)) {
				usedPairs.add(pairKey);
				relationships.push({
					id: faker.string.uuid(),
					skuId,
					attributeId,
					attributeValueId: faker.helpers.arrayElement(attributeValueIds)
				});
			}
		});
	});

	return relationships;
})();

// --- Generate SPU Tags ---
export const spuTags: Prisma.SpuTagCreateManyInput[] = (() => {
	const usedPairs = new Set<string>();
	const relationships: Prisma.SpuTagCreateManyInput[] = [];

	spuIds.forEach(spuId => {
		const numTags = faker.number.int({ min: 1, max: 4 });
		const selectedTags = faker.helpers.arrayElements(tagIds, numTags);

		selectedTags.forEach(tagId => {
			const pairKey = `${spuId}-${tagId}`;
			if (!usedPairs.has(pairKey)) {
				usedPairs.add(pairKey);
				relationships.push({
					id: faker.string.uuid(),
					spuId,
					tagId
				});
			}
		});
	});

	return relationships;
})();

// --- Generate SPU Variations ---
export const spuVariations: Prisma.SpuVariationCreateManyInput[] = spuIds
	.filter(() => faker.datatype.boolean(0.7)) // 70% of SPUs have variations
	.map(spuId => ({
		id: faker.string.uuid(),
		name: faker.helpers.arrayElement(['Màu sắc', 'Kích thước', 'Kiểu dáng', 'Chất liệu']),
		spuId,
		attributeId: faker.helpers.arrayElement(attributeIds.slice(0, 5)), // Use first 5 attributes for variations
		sortOrder: faker.number.int({ min: 0, max: 10 })
	}));

// --- Generate SKU Variation Values ---  
export const skuVariationValues: Prisma.SkuVariationValueCreateManyInput[] = [];
// Note: This requires spuVariationIds which are created after SPU variations are seeded
// Will be generated in the service after spuVariations are created

// Export all collections
export const seedCollections = {
	roles,
	permissions,
	rolePermissions,
	users,
	userRoles,
	categories,
	brands,
	shops,
	tags,
	attributes,
	attributeValues,
	spus,
	skus,
	oauth2Users,
	creditCards,
	sessions,
	codes,
	carts,
	storeProducts,
	vouchers,
	orders,
	orderProducts,
	voucherUsed,
	spuImages,
	skuImages,
	spuAttributes,
	skuAttributes,
	spuTags,
	spuVariations
	// skuVariationValues will be generated dynamically
};