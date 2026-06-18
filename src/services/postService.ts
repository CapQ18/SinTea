import { FeedItem } from '../types/feed';
import { getCurrentUser, getAllUsers } from './authService';
import { API, request } from './apiService';

const POSTS_STORAGE_KEY = 'sintea_posts';

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

const generateId = (): number => {
  return Date.now();
};

export const getPosts = (): FeedItem[] => {
  const data = localStorage.getItem(POSTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const savePosts = (posts: FeedItem[]): void => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

export const createPost = async (formData: PostFormData): Promise<FeedItem> => {
  const user = getCurrentUser();

  // 调用后端 API 发布动态
  try {
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

    // 同时保存到本地（用于本地展示）
    const newPost: FeedItem = {
      id: response.feedId || generateId(),
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

    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);

    return newPost;
  } catch (error) {
    // 如果 API 调用失败，仍然保存到本地
    console.error('发布动态到服务器失败，仅保存到本地:', error);

    const newPost: FeedItem = {
      id: generateId(),
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

    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);

    throw error; // 重新抛出错误，让调用者知道失败了
  }
};

export const toggleLike = (postId: number): FeedItem | null => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  
  if (index === -1) return null;
  
  posts[index] = {
    ...posts[index],
    isLiked: !posts[index].isLiked,
    likes: posts[index].isLiked ? posts[index].likes - 1 : posts[index].likes + 1,
  };
  
  savePosts(posts);
  return posts[index];
};

export const getPostById = (postId: number): FeedItem | undefined => {
  const posts = getPosts();
  return posts.find(p => p.id === postId);
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