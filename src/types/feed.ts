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
    tag: '#紫薯波波',
    type: 'recommend',
    content: '茶百道的紫薯波波真的绝了！紫薯味浓郁，波波Q弹，冰淇淋球更是点睛之笔！',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=purple%20taro%20milk%20tea%20with%20ice%20cream%20scoop%20on%20top%20and%20tapioca%20pearls%20at%20the%20bottom%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-11-4',
    comments: 999,
    likes: 999,
    isLiked: false,
    shop: '茶百道·万象城店',
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
    tag: '#草莓奶绿',
    type: 'recommend',
    content: '这家的草莓奶绿真的太惊艳了！新鲜草莓果肉配上脆啵啵，酸甜清爽～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pink%20strawberry%20milk%20tea%20with%20fresh%20strawberry%20slices%20and%20coconut%20jelly%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
    tag: '#波霸奶茶',
    type: 'recommend',
    content: '经典永流传！波霸奶茶永远是我的最爱，珍珠Q弹有嚼劲～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=classic%20milk%20tea%20with%20black%20tapioca%20pearls%20at%20the%20bottom%20ice%20cubes%20on%20top%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
      title: '多肉葡萄专业户',
      isFollowing: false,
    },
    tag: '#多肉葡萄',
    type: 'recommend',
    content: '多肉葡萄永远的神！葡萄新鲜多汁，芝士奶盖绝绝子～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=purple%20grape%20fruit%20tea%20with%20cheese%20foam%20on%20top%20fresh%20grapes%20inside%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
      title: '百香果爱好者',
      isFollowing: true,
    },
    tag: '#满杯百香果',
    type: 'recommend',
    content: '满杯百香果真的太酸爽了！满满的百香果果肉配上柠檬片～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=yellow%20passion%20fruit%20tea%20with%20lemon%20slices%20and%20passion%20fruit%20seeds%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-31',
    comments: 234,
    likes: 890,
    isLiked: false,
    shop: 'CoCo都可·望京SOHO店',
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
    tag: '#抹茶奶盖',
    type: 'recommend',
    content: '一点点的抹茶奶盖真的太好喝了！茶味浓郁，奶盖细腻～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=green%20matcha%20latte%20with%20cream%20foam%20on%20top%20in%20a%20clear%20plastic%20cup%20with%20green%20logo%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-30',
    comments: 45,
    likes: 67,
    isLiked: false,
    shop: '1点点·城西银泰店',
    rating: 4,
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
    tag: '#草莓奶绿',
    type: 'recommend',
    content: '古茗的草莓奶绿真的很绝！草莓新鲜，奶绿清香～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pink%20strawberry%20milk%20tea%20with%20fresh%20strawberry%20slices%20and%20coconut%20jelly%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
    tag: '#波霸奶茶',
    type: 'recommend',
    content: '茶颜的波霸奶茶虽然简单，但味道真的很纯粹～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=classic%20milk%20tea%20with%20black%20tapioca%20pearls%20at%20the%20bottom%20ice%20cubes%20on%20top%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
    tag: '#多肉葡萄',
    type: 'recommend',
    content: '蜜雪的多肉葡萄真的惊艳到我了！价格便宜但味道一点不含糊～',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=purple%20grape%20fruit%20tea%20with%20cheese%20foam%20on%20top%20fresh%20grapes%20inside%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
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
    tag: '#满杯百香果',
    type: 'warning',
    content: 'CoCo的满杯百香果今天踩雷了，百香果不够新鲜...',
    images: [
      'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=yellow%20passion%20fruit%20tea%20with%20lemon%20slices%20and%20passion%20fruit%20seeds%20in%20a%20clear%20plastic%20cup%20white%20background%20food%20photography&image_size=square',
    ],
    date: '2025-10-26',
    comments: 23,
    likes: 45,
    isLiked: false,
    shop: 'CoCo都可·万达广场店',
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
