export interface User {
  id: number;
  nickname: string;
  avatar: string;
  bio: string;
  drinksCount: number;
  reviewCount: number;
  likeCount: number;
  tasteProfile: TasteProfile;
}

export interface TasteProfile {
  sweetness: number;
  teaFlavor: number;
  milkFlavor: number;
  iceLevel: number;
}

export interface Shop {
  id: number;
  name: string;
  address: string;
  rating: number;
}

export interface Review {
  id: number;
  drinkName: string;
  shopName: string;
  shopId: number;
  image: string;
  rating: number;
  keywords: string[];
  likes: number;
  comments: number;
  isPositive: boolean;
  content: string;
  createdAt: string;
  userId: number;
  images: string[];
  isPublic: boolean;
}

export interface WishlistItem {
  id: number;
  drinkName: string;
  shopName: string;
  image: string;
  category: 'milk-tea' | 'fruit-tea' | 'coffee' | 'other';
  addedAt: string;
  isDrunk: boolean;
}

export type Category = 'all' | 'milk-tea' | 'fruit-tea' | 'coffee';

export type EmotionType = 'happy' | 'confused' | 'surprised' | 'sleeping';
export type SpriteSize = 'large' | 'medium' | 'small';
