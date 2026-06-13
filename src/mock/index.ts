export interface Review {
  id: number;
  drinkName: string;
  shopName: string;
  image: string;
  rating: number;
  keywords: string[];
  likes: number;
  comments: number;
  isPositive: boolean;
  content: string;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  drinkName: string;
  shopName: string;
  image: string;
  category: '奶茶' | '果茶' | '咖啡';
  addedAt: string;
  isDrank: boolean;
  price?: string;
  rating?: number;
}

export interface UserProfile {
  nickname: string;
  signature: string;
  avatar: string;
  totalCups: number;
  totalReviews: number;
  totalLikes: number;
  dna: {
    sweet: number;
    tea: number;
    milk: number;
    ice: number;
    texture: number;
    look: number;
  };
  tags: string[];
  badges: {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
  }[];
}

export interface RankingItem {
  rank: number;
  name: string;
  shop: string;
  score: number;
}

export const mockReviews: Review[] = [
  {
    id: 1,
    drinkName: '杨枝甘露',
    shopName: '茶百道',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mango%20sago%20dessert%20drink%20with%20pomelo%20fresh%20fruit%20bowl&image_size=square',
    rating: 5,
    keywords: ['清爽', '料多', '酸甜'],
    likes: 128,
    comments: 32,
    isPositive: true,
    content: '料超级多！芒果和西柚都很新鲜，夏天喝太爽了',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    drinkName: '幽兰拿铁',
    shopName: '茶颜悦色',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=traditional%20chinese%20milk%20tea%20with%20cream%20foam%20artistic&image_size=square',
    rating: 5,
    keywords: ['茶香', '细腻', '回味'],
    likes: 256,
    comments: 48,
    isPositive: true,
    content: '茶味和奶味完美融合，不愧是招牌！',
    createdAt: '2024-01-14',
  },
  {
    id: 3,
    drinkName: '多肉葡萄',
    shopName: '喜茶',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20grape%20fruit%20tea%20with%20cheese%20foam%20purple%20color&image_size=square',
    rating: 4,
    keywords: ['新鲜', '果香', '清爽'],
    likes: 189,
    comments: 23,
    isPositive: true,
    content: '葡萄很大颗，就是价格有点贵',
    createdAt: '2024-01-13',
  },
  {
    id: 4,
    drinkName: '霸气橙子',
    shopName: '奈雪的茶',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20orange%20tea%20with%20orange%20slices%20refreshing%20summer%20drink&image_size=square',
    rating: 5,
    keywords: ['维C', '清爽', '解渴'],
    likes: 167,
    comments: 31,
    isPositive: true,
    content: '满满的橙子果肉，超满足！',
    createdAt: '2024-01-12',
  },
  {
    id: 5,
    drinkName: '芋泥波波奶茶',
    shopName: '一点点',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=taro%20purple%20milk%20tea%20with%20boba%20pearls%20creamy&image_size=square',
    rating: 3,
    keywords: ['芋泥', '甜腻', '一般'],
    likes: 45,
    comments: 12,
    isPositive: false,
    content: '芋泥太甜了，喝多了会腻',
    createdAt: '2024-01-11',
  },
  {
    id: 6,
    drinkName: '芝士奶盖红茶',
    shopName: 'CoCo都可',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=black%20tea%20with%20cheese%20foam%20layer%20creamy%20texture&image_size=square',
    rating: 4,
    keywords: ['奶盖', '浓郁', '茶香'],
    likes: 98,
    comments: 18,
    isPositive: true,
    content: '奶盖很浓郁，红茶味道正宗',
    createdAt: '2024-01-10',
  },
  {
    id: 7,
    drinkName: '珍珠奶茶',
    shopName: '蜜雪冰城',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=classic%20bubble%20milk%20tea%20with%20black%20pearls%20simple&image_size=square',
    rating: 4,
    keywords: ['经典', '便宜', '实惠'],
    likes: 234,
    comments: 45,
    isPositive: true,
    content: '经典款永远不会出错，性价比超高！',
    createdAt: '2024-01-09',
  },
  {
    id: 8,
    drinkName: '抹茶拿铁',
    shopName: '星巴克',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=matcha%20green%20tea%20latte%20creamy%20foam%20art&image_size=square',
    rating: 4,
    keywords: ['抹茶', '香醇', '回甘'],
    likes: 134,
    comments: 27,
    isPositive: true,
    content: '抹茶粉很细腻，口感不错',
    createdAt: '2024-01-08',
  },
];

export const mockWishlist: WishlistItem[] = [
  {
    id: 1,
    drinkName: '杨枝甘露',
    shopName: '茶百道',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mango%20sago%20dessert%20with%20fresh%20fruit%20asian%20drink&image_size=square',
    category: '果茶',
    addedAt: '3天前',
    isDrank: false,
    rating: 5,
    price: '¥18',
  },
  {
    id: 2,
    drinkName: '幽兰拿铁',
    shopName: '茶颜悦色',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20style%20milk%20tea%20with%20cream%20foam%20premium&image_size=square',
    category: '奶茶',
    addedAt: '1周前',
    isDrank: false,
    rating: 5,
    price: '¥16',
  },
  {
    id: 3,
    drinkName: '生椰拿铁',
    shopName: '瑞幸咖啡',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=coconut%20latte%20coffee%20with%20coconut%20milk%20creamy&image_size=square',
    category: '咖啡',
    addedAt: '2周前',
    isDrank: true,
    rating: 4,
    price: '¥22',
  },
  {
    id: 4,
    drinkName: '多肉芒芒',
    shopName: '喜茶',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20mango%20fruit%20tea%20with%20coconut%20jelly%20yellow&image_size=square',
    category: '果茶',
    addedAt: '3周前',
    isDrank: false,
    rating: 4,
    price: '¥28',
  },
  {
    id: 5,
    drinkName: '波波奶茶',
    shopName: '一点点',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=classic%20boba%20milk%20tea%20with%20black%20pearls%20taiwanese&image_size=square',
    category: '奶茶',
    addedAt: '1个月前',
    isDrank: true,
    rating: 4,
    price: '¥12',
  },
  {
    id: 6,
    drinkName: '芝士莓莓',
    shopName: '奈雪的茶',
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=strawberry%20tea%20with%20cheese%20foam%20pink%20color%20fresh&image_size=square',
    category: '果茶',
    addedAt: '1个月前',
    isDrank: false,
    rating: 5,
    price: '¥26',
  },
];

export const mockUserProfile: UserProfile = {
  nickname: '奶茶小达人',
  signature: '喝遍天下奶茶',
  avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20cartoon%20avatar%20milk%20tea%20lover&image_size=square',
  totalCups: 128,
  totalReviews: 56,
  totalLikes: 2340,
  dna: {
    sweet: 3,
    tea: 7,
    milk: 5,
    ice: 6,
    texture: 8,
    look: 7,
  },
  tags: ['清爽型', '少糖派', '果茶控'],
  badges: [
    { id: '1', name: '初尝者', icon: '🥇', unlocked: true },
    { id: '2', name: '探索家', icon: '🥈', unlocked: true },
    { id: '3', name: '鉴赏师', icon: '🥉', unlocked: true },
    { id: '4', name: '人气王', icon: '👑', unlocked: false },
    { id: '5', name: '百杯达人', icon: '💯', unlocked: false },
    { id: '6', name: '夜猫子', icon: '🌙', unlocked: true },
  ],
};

export const mockRanking: RankingItem[] = [
  { rank: 1, name: '多肉葡萄', shop: '喜茶', score: 9.2 },
  { rank: 2, name: '霸气橙子', shop: '奈雪', score: 9.0 },
  { rank: 3, name: '幽兰拿铁', shop: '茶颜悦色', score: 8.8 },
  { rank: 4, name: '杨枝甘露', shop: '茶百道', score: 8.7 },
  { rank: 5, name: '生椰拿铁', shop: '瑞幸', score: 8.5 },
];

export const drinkSuggestions = [
  '杨枝甘露', '幽兰拿铁', '多肉葡萄', '霸气橙子', '芋泥波波',
  '芝士奶盖', '生椰拿铁', '抹茶拿铁', '珍珠奶茶', '水果茶',
];

export const shopSuggestions = [
  '喜茶', '奈雪的茶', '茶颜悦色', '茶百道', '一点点',
  'CoCo都可', '蜜雪冰城', '瑞幸咖啡', '星巴克', '古茗',
];
