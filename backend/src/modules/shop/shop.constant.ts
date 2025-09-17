export const SHOP_CONSTANT = {
	slugShop: (name: string | undefined, model: 'category' | 'shop' | 'spu' | 'tag') => `${model}/${name}`,
	TIME_FILE_CACHE: {
		CACHE_LARGE_DATA: 30
	},
	
} 