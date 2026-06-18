import { FeedItem } from '../types/feed';
import { getCurrentUser, getAllUsers } from './authService';
import { API, request } from './apiService';

export interface PostFormData {
  shopName: string;
  drinkName: string;
  content: string;
  type: 'recommend' | 'neutral' | 'warning';
  images: string[];
  rating?: number;
  dna: {
    sweetness: number;
    tea: number;
    milk: number;
    taste: number;
    coolness: number;
    appearance: number;
  };
}

export const createPost = async (formData: PostFormData): Promise<FeedItem> => {
  const user = getCurrentUser();

  const response = await request<{ success: boolean; feedId?: number; message?: string }>(
    API.feeds.create,
    {
      method: 'POST',
      body: JSON.stringify({
        shopName: formData.shopName,
        drinkName: formData.drinkName,
        content: formData.content,
        type: formData.type,
        images: formData.images,
        rating: formData.rating || 3,
        sweetness: formData.dna.sweetness,
        tea: formData.dna.tea,
        milk: formData.dna.milk,
        taste: formData.dna.taste,
        coolness: formData.dna.coolness,
        appearance: formData.dna.appearance,
      }),
    }
  );

  if (!response.success) {
    throw new Error(response.message || '发布失败');
  }

  return {
    id: response.feedId || Date.now(),
    userId: user?.id || '',
    user: {
      id: Number(user?.id || 0),
      avatar: user?.avatar || '',
      name: user?.nickname || user?.username || '用户',
      title: '',
      isFollowing: false,
    },
    tag: `#${formData.drinkName}`,
    type: formData.type,
    content: formData.content,
    images: formData.images,
    date: new Date().toLocaleDateString('zh-CN'),
    comments: 0,
    likes: 0,
    isLiked: false,
    shop: formData.shopName,
    rating: formData.type === 'recommend' ? 5 : formData.type === 'neutral' ? 3 : 1,
    location: '本地',
  };
};

export const toggleLike = async (postId: number): Promise<FeedItem | null> => {
  try {
    await request<{ success: boolean }>(API.feeds.like(String(postId)), {
      method: 'POST',
    });
    return null;
  } catch {
    return null;
  }
};

export const enrichPostsWithUser = async (posts: FeedItem[]): Promise<FeedItem[]> => {
  const users = await getAllUsers();
  
  return posts.map(post => {
    if (post.userId) {
      const user = users.find(u => u.id === post.userId);
      if (user) {
        return {
          ...post,
          user: {
            id: Number(user.id),
            avatar: user.avatar,
            name: user.nickname || user.username,
            title: '',
            isFollowing: false,
          },
        };
      }
    }
    return post;
  });
};
