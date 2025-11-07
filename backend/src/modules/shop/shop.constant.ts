export const SHOP_CONSTANT = {
  slugShop: (
    name: string | undefined,
    model: 'category' | 'shop' | 'spu' | 'tag',
  ) => `${model}/${name}`,
  TIME_FILE_CACHE: {
    CACHE_LARGE_DATA: 30,
  },
  SHOPS_LIKE_NAME_LEY: (mainkey: string) => `shopsLikeName:${mainkey}`,
};
