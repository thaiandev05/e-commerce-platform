export const SHOP_CONSTANT = {
	slugShop: (name: string | undefined, model: 'category' | 'shop' | 'spu' | 'tag') => `${model}/${name}`
} 