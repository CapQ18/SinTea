export interface FeedUser {
  id: number;
  avatar: string;
  name: string;
  title: string;
  isFollowing?: boolean;
}

export interface FeedItem {
  id: number;
  user: FeedUser;
  tag: string;
  type: 'recommend' | 'warning';
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
    tag: '#杨枝甘露',
    type: 'recommend',
    content: '今天去喝了这家奶茶，真的是太赞了！清爽不腻，料很足，芒果和西柚的搭配绝绝子！强烈推荐给大家～',
    images: [
      'https://picsum.photos/seed/milktea1/400/400',
      'https://picsum.photos/seed/milktea2/400/400',
      'https://picsum.photos/seed/milktea3/400/400',
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
    tag: '#幽兰拿铁',
    type: 'warning',
    content: '这家店真的踩雷了！茶颜悦色的幽兰拿铁，味道一般般，茶味太重了，奶盖也不够细腻...',
    images: ['https://picsum.photos/seed/bad1/400/400'],
    date: '2025-11-3',
    comments: 32,
    likes: 128,
    isLiked: false,
    shop: '茶颜悦色·五一广场店',
    rating: 2,
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
    tag: '#霸气橙子',
    type: 'recommend',
    content: '每次来奈雪必点的霸气橙子！满满的橙子果肉，酸酸甜甜的超级解腻~',
    images: [
      'https://picsum.photos/seed/orange1/400/400',
      'https://picsum.photos/seed/orange2/400/400',
    ],
    date: '2025-11-2',
    comments: 156,
    likes: 567,
    isLiked: true,
    shop: '奈雪的茶·国贸中心店',
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
    content: '多肉葡萄永远的神！葡萄很新鲜，波波也很Q弹，夏天喝一杯太幸福了~',
    images: ['https://picsum.photos/seed/grape1/400/400'],
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
      title: '生椰拿铁爱好者',
      isFollowing: true,
    },
    tag: '#生椰拿铁',
    type: 'recommend',
    content: '瑞幸的生椰拿铁真的太绝了！椰香味浓郁，咖啡口感丝滑，早晨来一杯提神醒脑~',
    images: [
      'https://picsum.photos/seed/coconut1/400/400',
      'https://picsum.photos/seed/coconut2/400/400',
      'https://picsum.photos/seed/coconut3/400/400',
    ],
    date: '2025-10-31',
    comments: 234,
    likes: 890,
    isLiked: false,
    shop: '瑞幸咖啡·望京SOHO店',
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
    tag: '#波霸奶茶',
    type: 'warning',
    content: '说好的波霸波霸，结果珍珠小到怀疑人生...这家店是不是偷工减料了？',
    images: ['https://picsum.photos/seed/small1/400/400'],
    date: '2025-10-30',
    comments: 45,
    likes: 67,
    isLiked: false,
    shop: '一点点·城西银泰店',
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
    content: '古茗的杨枝甘露性价比超高！芒果很新鲜，西柚微苦回甘，价格也很美丽~',
    images: [
      'https://picsum.photos/seed/guming1/400/400',
      'https://picsum.photos/seed/guming2/400/400',
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
    tag: '#筝筝纸鸢',
    type: 'recommend',
    content: '筝筝纸鸢真的是我的心头好！虽然只是简简单单的乌龙茶，但那种清香真的很舒服~',
    images: ['https://picsum.photos/seed/zheng1/400/400'],
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
    tag: '#珍珠奶茶',
    type: 'recommend',
    content: '谁说便宜没好货？蜜雪的珍珠奶茶4块钱，珍珠Q弹奶茶香，还要什么自行车！',
    images: [
      'https://picsum.photos/seed/mixue1/400/400',
      'https://picsum.photos/seed/mixue2/400/400',
      'https://picsum.photos/seed/mixue3/400/400',
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
    tag: '#鲜芋奶茶',
    type: 'warning',
    content: 'CoCo的鲜芋奶茶今天踩雷了，芋泥不够细腻，奶茶味道也很淡...希望能改进一下品控',
    images: ['https://picsum.photos/seed/coco1/400/400'],
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
