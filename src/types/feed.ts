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

export const feedMockData: FeedItem[] = [];

export const currentUser: FeedUser = {
  id: 0,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  name: '我',
  title: '',
  isFollowing: false,
};