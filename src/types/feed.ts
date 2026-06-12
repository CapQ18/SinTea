export interface FeedUser {
  id: number;
  avatar: string;
  name: string;
  title: string;
  isFollowing?: boolean;
}

export interface FeedItem {
  id: number;
  userId?: string;
  user: FeedUser;
  tag: string;
  type: 'recommend' | 'neutral' | 'warning';
  content: string;
  images: string[];
  date: string;
  comments: number;
  likes: number;
  isLiked: boolean;
  shop?: string;
  rating?: number;
  location?: string;
}

export interface Comment {
  id: number;
  user: {
    avatar: string;
    name: string;
  };
  content: string;
  date: string;
  likes?: number;
}

export const feedMockData: FeedItem[] = [
  {
    id: 1,
    user: {
      id: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
      name: '饮茶达人',
      title: '奶茶控',
      isFollowing: false,
    },
    tag: '#草莓奶昔',
    type: 'recommend',
    content: '这家的草莓奶昔真的绝了！新鲜草莓打成泥，配上顺滑的奶盖，一口下去超级满足～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pink%20strawberry%20milkshake%20with%20fresh%20strawberry%20pieces%20on%20top%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-11-4',
    comments: 999,
    likes: 999,
    isLiked: false,
    shop: '喜茶·万象城店',
    rating: 5,
    location: '成都·万象城',
  },
  {
    id: 2,
    user: {
      id: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
      name: '奶茶小透明',
      title: '新手饮家',
      isFollowing: true,
    },
    tag: '#杨枝甘露',
    type: 'recommend',
    content: '杨枝甘露永远的神！芒果香浓，西柚微苦回甘，配上脆波波，口感层次超级丰富～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=yellow%20mango%20sago%20dessert%20with%20pomelo%20and%20coconut%20jelly%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-11-3',
    comments: 32,
    likes: 128,
    isLiked: false,
    shop: '奈雪的茶·五一广场店',
    rating: 5,
    location: '长沙·五一广场',
  },
  {
    id: 3,
    user: {
      id: 3,
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: '奈雪女孩',
      title: '水果茶爱好者',
      isFollowing: false,
    },
    tag: '#柠檬红茶',
    type: 'recommend',
    content: '夏天必备！柠檬红茶清爽解腻，柠檬片新鲜，茶味浓郁，冰爽十足～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=iced%20lemon%20black%20tea%20with%20lemon%20slice%20and%20ice%20cubes%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-11-2',
    comments: 156,
    likes: 567,
    isLiked: true,
    shop: '一点点·国贸中心店',
    rating: 5,
    location: '北京·国贸',
  },
  {
    id: 4,
    user: {
      id: 4,
      avatar: 'https://i.pravatar.cc/150?img=4',
      name: '喜茶忠实粉丝',
      title: '抹茶控',
      isFollowing: false,
    },
    tag: '#抹茶拿铁',
    type: 'recommend',
    content: '抹茶控必点！浓郁的抹茶味配上香甜的冰淇淋球，波波Q弹，绝绝子～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=green%20matcha%20latte%20with%20matcha%20ice%20cream%20scoop%20and%20tapioca%20pearls%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-11-1',
    comments: 89,
    likes: 234,
    isLiked: false,
    shop: '喜茶·太古里店',
    rating: 5,
    location: '上海·太古里',
  },
  {
    id: 5,
    user: {
      id: 5,
      avatar: 'https://i.pravatar.cc/150?img=5',
      name: '咖啡续命党',
      title: '霸王茶姬粉丝',
      isFollowing: true,
    },
    tag: '#伯牙绝弦',
    type: 'recommend',
    content: '霸王茶姬的伯牙绝弦真的太绝了！茶香味浓，奶味适中，颜值还高～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=elegant%20milk%20tea%20in%20a%20white%20paper%20cup%20with%20floral%20design%20and%20black%20lid%20on%20black%20leather%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-31',
    comments: 234,
    likes: 890,
    isLiked: false,
    shop: '霸王茶姬·望京SOHO店',
    rating: 5,
    location: '北京·望京',
  },
  {
    id: 6,
    user: {
      id: 6,
      avatar: 'https://i.pravatar.cc/150?img=6',
      name: '一点点收购商',
      title: '奶茶平民窟',
      isFollowing: false,
    },
    tag: '#草莓奶昔',
    type: 'warning',
    content: '今天踩雷了...草莓不够新鲜，奶昔味道很淡，感觉不值得这个价格',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pink%20strawberry%20milkshake%20with%20fresh%20strawberry%20pieces%20on%20top%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-30',
    comments: 45,
    likes: 67,
    isLiked: false,
    shop: '某不知名奶茶店',
    rating: 1,
    location: '杭州·城西银泰',
  },
  {
    id: 7,
    user: {
      id: 7,
      avatar: 'https://i.pravatar.cc/150?img=7',
      name: '古茗发烧友',
      title: '浙江奶茶扛把子',
      isFollowing: false,
    },
    tag: '#杨枝甘露',
    type: 'recommend',
    content: '古茗的杨枝甘露真的很绝！芒果新鲜，西柚酸甜，性价比超高～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=yellow%20mango%20sago%20dessert%20with%20pomelo%20and%20coconut%20jelly%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-29',
    comments: 78,
    likes: 345,
    isLiked: true,
    shop: '古茗·下沙店',
    rating: 4,
    location: '杭州·下沙',
  },
  {
    id: 8,
    user: {
      id: 8,
      avatar: 'https://i.pravatar.cc/150?img=8',
      name: '茶颜本地人',
      title: '长沙土著',
      isFollowing: true,
    },
    tag: '#柠檬红茶',
    type: 'recommend',
    content: '茶颜的柠檬红茶虽然简单，但茶香味真的很足，夏天喝超级清爽～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=iced%20lemon%20black%20tea%20with%20lemon%20slice%20and%20ice%20cubes%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-28',
    comments: 56,
    likes: 189,
    isLiked: false,
    shop: '茶颜悦色·太平街店',
    rating: 5,
    location: '长沙·太平街',
  },
  {
    id: 9,
    user: {
      id: 9,
      avatar: 'https://i.pravatar.cc/150?img=9',
      name: '蜜雪冰城代言人',
      title: '平民奶茶王',
      isFollowing: false,
    },
    tag: '#抹茶拿铁',
    type: 'recommend',
    content: '蜜雪的抹茶拿铁真的惊艳到我了！抹茶味浓郁，价格还便宜～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=green%20matcha%20latte%20with%20matcha%20ice%20cream%20scoop%20and%20tapioca%20pearls%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-27',
    comments: 567,
    likes: 2340,
    isLiked: false,
    shop: '蜜雪冰城·大学城店',
    rating: 4,
    location: '武汉·大学城',
  },
  {
    id: 10,
    user: {
      id: 10,
      avatar: 'https://i.pravatar.cc/150?img=10',
      name: 'CoCo研究员',
      title: '奶茶测评师',
      isFollowing: false,
    },
    tag: '#伯牙绝弦',
    type: 'warning',
    content: '今天在别家喝的伯牙绝弦踩雷了，茶味太淡，奶味太重...',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=elegant%20milk%20tea%20in%20a%20white%20paper%20cup%20with%20floral%20design%20and%20black%20lid%20on%20black%20leather%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-26',
    comments: 23,
    likes: 45,
    isLiked: false,
    shop: '某山寨奶茶店',
    rating: 2,
    location: '南京·万达广场',
  },
];

export const currentUser: FeedUser = {
  id: 0,
  avatar: 'https://i.pravatar.cc/150?img=0',
  name: '我的头像',
  title: '奶茶新人',
};
