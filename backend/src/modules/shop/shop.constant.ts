export const SHOP_CONSTANT = {
	slugShop: (name: string, model: 'category' | 'shop' | 'spu' | 'tag') => `${model}/${name}`
} 