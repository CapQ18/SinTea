export interface Comment {
  id: number;
  user: {
    avatar: string;
    name: string;
  };
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

export interface FeedUser {
  id: number;
  avatar: string;
  name: string;
  title: string;
  isFollowing: boolean;
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
  shop: string;
  rating: number;
  location: string;
}

export const feedMockData: FeedItem[] = [
  {
    id: 1,
    user: {
      id: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea1',
      name: '饮茶达人',
      title: '奶茶控',
      isFollowing: false,
    },
    tag: '#奶茶分享',
    type: 'recommend',
    content: '终于喝到了！这家店的奶茶真的太赞了，茶香浓郁，奶味醇厚～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=delicious%20milk%20tea%20with%20boba%20pearls%20food%20photography&image_size=square'],
    date: '2025-11-4',
    comments: 999,
    likes: 999,
    isLiked: false,
    shop: '1点点·万象城店',
    rating: 5,
    location: '成都·万象城',
  },
  {
    id: 2,
    user: {
      id: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea2',
      name: '奶茶小透明',
      title: '新手饮家',
      isFollowing: true,
    },
    tag: '#新品推荐',
    type: 'recommend',
    content: '这家的新品真的太惊艳了！颜值与口感并存～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=premium%20milk%20tea%20with%20beautiful%20presentation%20aesthetic&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea3',
      name: '奈雪女孩',
      title: '水果茶爱好者',
      isFollowing: false,
    },
    tag: '#水果茶',
    type: 'recommend',
    content: '经典永流传！水果茶永远是我的最爱，清爽解腻～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20fruit%20tea%20with%20mixed%20fruits%20refreshing&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea4',
      name: '喜茶忠实粉丝',
      title: '多肉葡萄专业户',
      isFollowing: false,
    },
    tag: '#好物分享',
    type: 'recommend',
    content: '今天又来打卡了！每次来都有新惊喜，味道一如既往的棒～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20grape%20tea%20with%20cheese%20foam%20purple%20aesthetic&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea5',
      name: '咖啡续命党',
      title: '百香果爱好者',
      isFollowing: true,
    },
    tag: '#今日份快乐',
    type: 'recommend',
    content: '这杯奶茶真的太绝了！每一口都是幸福的味道～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=taro%20milk%20tea%20with%20boba%20purple%20creamy&image_size=square'],
    date: '2025-10-31',
    comments: 234,
    likes: 890,
    isLiked: false,
    shop: '茶百道·望京SOHO店',
    rating: 5,
    location: '北京·望京',
  },
  {
    id: 6,
    user: {
      id: 6,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea6',
      name: '一点点收购商',
      title: '奶茶平民窟',
      isFollowing: false,
    },
    tag: '#奶茶日记',
    type: 'recommend',
    content: '强烈推荐这家的招牌奶茶！性价比超高，味道也很赞～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cheese%20milk%20tea%20with%20tea%20base%20creamy%20foam&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea7',
      name: '古茗发烧友',
      title: '浙江奶茶扛把子',
      isFollowing: false,
    },
    tag: '#下午茶时光',
    type: 'recommend',
    content: '下午茶时间到！今天尝试了新品，真的太好喝了～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=iced%20milk%20tea%20with%20ice%20cubes%20refreshing%20summer&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea8',
      name: '茶颜本地人',
      title: '长沙土著',
      isFollowing: true,
    },
    tag: '#奶茶探店',
    type: 'recommend',
    content: '又来探店了！这家店的环境很棒，奶茶也很不错～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=matcha%20green%20tea%20latte%20with%20creamy%20texture&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea9',
      name: '蜜雪冰城代言人',
      title: '平民奶茶王',
      isFollowing: false,
    },
    tag: '#宝藏店铺',
    type: 'recommend',
    content: '这家奶茶真的惊艳到我了！便宜又好喝，学生党福音～',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=coconut%20coffee%20latte%20creamy%20smooth%20texture&image_size=square'],
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea10',
      name: 'CoCo研究员',
      title: '奶茶测评师',
      isFollowing: false,
    },
    tag: '#踩雷记录',
    type: 'warning',
    content: '今天踩雷了...这家店的服务态度一般，味道也比较普通。',
    images: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20tea%20with%20grass%20jelly%20traditional%20style&image_size=square'],
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
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  name: '我',
  title: '',
  isFollowing: false,
};