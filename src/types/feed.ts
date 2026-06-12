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
    tag: '#抹茶奶盖',
    type: 'recommend',
    content: '一点点的抹茶奶盖真的太好喝了！茶味浓郁，奶盖细腻～',
    images: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop',
    ],
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
    tag: '#荔枝冰糯',
    type: 'recommend',
    content: '茶颜悦色的荔枝冰糯真的太惊艳了！荔枝香甜，口感软糯～',
    images: [
      'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=400&h=400&fit=crop',
    ],
    date: '2025-11-3',
    comments: 32,
    likes: 128,
    isLiked: false,
    shop: '茶颜悦色·五一广场店',
    rating: 5,
    location: '长沙·五一广场',
  },
  {
    id: 3,
    user: {
      id: 3,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea3',
      name: '懒山石苑粉丝',
      title: '云南手作酸奶',
      isFollowing: false,
    },
    tag: '#玫瑰酸奶',
    type: 'recommend',
    content: '懒山石苑的玫瑰酸奶真的绝了！颜值超高，味道也很棒～',
    images: [
      'https://images.unsplash.com/photo-1544561264-214680616508?w=400&h=400&fit=crop',
    ],
    date: '2025-11-2',
    comments: 156,
    likes: 567,
    isLiked: true,
    shop: '懒山石苑·太古里店',
    rating: 5,
    location: '成都·太古里',
  },
  {
    id: 4,
    user: {
      id: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea4',
      name: '一点点狂热爱好者',
      title: '波霸专业户',
      isFollowing: false,
    },
    tag: '#粉色波霸',
    type: 'recommend',
    content: '一点点的粉色波霸真的太少女心了！粉粉嫩嫩超好看～',
    images: [
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d2f?w=400&h=400&fit=crop',
    ],
    date: '2025-11-1',
    comments: 89,
    likes: 234,
    isLiked: false,
    shop: '1点点·望京SOHO店',
    rating: 5,
    location: '北京·望京',
  },
  {
    id: 5,
    user: {
      id: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea5',
      name: '外卖达人',
      title: '饿了么常客',
      isFollowing: true,
    },
    tag: '#草莓A2牛乳',
    type: 'recommend',
    content: '一点点的草莓A2牛乳绿茶真的太好喝了！草莓新鲜，牛乳香浓～',
    images: [
      'https://images.unsplash.com/photo-1514434638288-47eddd926ed1?w=400&h=400&fit=crop',
    ],
    date: '2025-10-31',
    comments: 234,
    likes: 890,
    isLiked: false,
    shop: '1点点·天等店',
    rating: 5,
    location: '南宁·天等',
  },
  {
    id: 6,
    user: {
      id: 6,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea6',
      name: '茶颜收集者',
      title: '长沙土著',
      isFollowing: false,
    },
    tag: '#声声乌龙',
    type: 'recommend',
    content: '茶颜悦色的声声乌龙永远的神！蜜桃乌龙清香，奶沫细腻～',
    images: [
      'https://images.unsplash.com/photo-1556648202-366d90a876e6?w=400&h=400&fit=crop',
    ],
    date: '2025-10-30',
    comments: 45,
    likes: 67,
    isLiked: false,
    shop: '茶颜悦色·太平街店',
    rating: 4,
    location: '长沙·太平街',
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
    tag: '#草莓奶绿',
    type: 'recommend',
    content: '古茗的草莓奶绿真的很绝！新鲜草莓配上脆啵啵～',
    images: [
      'https://images.unsplash.com/photo-1526424850145-8d392ae8c39c?w=400&h=400&fit=crop',
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea8',
      name: '喜茶忠实粉丝',
      title: '多肉葡萄专业户',
      isFollowing: true,
    },
    tag: '#多肉葡萄',
    type: 'recommend',
    content: '多肉葡萄永远的神！葡萄新鲜多汁，芝士奶盖绝绝子～',
    images: [
      'https://images.unsplash.com/photo-1571877227200-8a9552952e8c?w=400&h=400&fit=crop',
    ],
    date: '2025-10-28',
    comments: 56,
    likes: 189,
    isLiked: false,
    shop: '喜茶·太古里店',
    rating: 5,
    location: '上海·太古里',
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
    tag: '#满杯百香果',
    type: 'recommend',
    content: '满杯百香果真的太酸爽了！满满的百香果果肉配上柠檬片～',
    images: [
      'https://images.unsplash.com/photo-1565043825793-6e0717627b43?w=400&h=400&fit=crop',
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea10',
      name: 'CoCo研究员',
      title: '奶茶测评师',
      isFollowing: false,
    },
    tag: '#波霸奶茶',
    type: 'warning',
    content: 'CoCo的波霸奶茶今天踩雷了，珍珠不够Q弹...',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
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
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  name: '我',
  title: '',
  isFollowing: false,
};