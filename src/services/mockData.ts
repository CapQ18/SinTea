import { User, Review, WishlistItem, Shop } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockUsers: User[] = [
  {
    id: 1,
    nickname: '奶茶控小甜',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=milktea',
    bio: '一天一杯奶茶，快乐似神仙！',
    drinksCount: 0,
    reviewCount: 0,
    likeCount: 0,
    tasteProfile: {
      sweetness: 50,
      teaFlavor: 50,
      milkFlavor: 50,
      iceLevel: 50,
    },
  },
];

export const mockShops: Shop[] = [
  { id: 1, name: '喜茶', address: '北京市朝阳区三里屯', rating: 4.8 },
  { id: 2, name: '奈雪的茶', address: '上海市静安区南京西路', rating: 4.7 },
  { id: 3, name: '茶颜悦色', address: '湖南省长沙市坡子街', rating: 4.9 },
  { id: 4, name: 'CoCo都可', address: '广东省深圳市福田区', rating: 4.5 },
  { id: 5, name: '一点点', address: '浙江省杭州市西湖区', rating: 4.6 },
  { id: 6, name: '蜜雪冰城', address: '河南省郑州市二七区', rating: 4.4 },
  { id: 7, name: '瑞幸咖啡', address: '北京市海淀区中关村', rating: 4.6 },
  { id: 8, name: '星巴克', address: '上海市浦东新区陆家嘴', rating: 4.7 },
  { id: 9, name: '古茗', address: '浙江省宁波市海曙区', rating: 4.5 },
  { id: 10, name: '沪上阿姨', address: '江苏省南京市新街口', rating: 4.4 },
];

const mockReviews: Review[] = [];

export const mockWishlist: WishlistItem[] = [];

export const getReviews = async (page: number, _category: string = 'all') => {
  await delay(300);
  return {
    data: [],
    total: 0,
    page,
    pageSize: 10,
  };
};

export const getReviewDetail = async (_id: number) => {
  await delay(300);
  return null;
};

export const postReview = async (data: Omit<Review, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
  await delay(500);
  const newReview: Review = {
    ...data,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
  };
  mockReviews.unshift(newReview);
  return newReview;
};

export const getWishlist = async () => {
  await delay(300);
  return mockWishlist;
};

export const addToWishlist = async (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
  await delay(300);
  const newItem: WishlistItem = {
    ...item,
    id: Date.now(),
    addedAt: new Date().toISOString(),
  };
  mockWishlist.push(newItem);
  return newItem;
};

export const toggleWishlistDrunk = async (id: number) => {
  await delay(200);
  const item = mockWishlist.find(w => w.id === id);
  if (item) {
    item.isDrunk = !item.isDrunk;
  }
  return item;
};

export const removeFromWishlist = async (id: number) => {
  await delay(200);
  const index = mockWishlist.findIndex(w => w.id === id);
  if (index > -1) {
    mockWishlist.splice(index, 1);
  }
  return true;
};

export const getUserProfile = async () => {
  await delay(300);
  return mockUsers[0];
};
