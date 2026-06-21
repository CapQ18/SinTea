const API_BASE_URL = '';  // 始终用相对路径：prod 走 Pages Functions，dev 走 Vite proxy

export const API = {
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
  },
  users: {
    get: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    update: `${API_BASE_URL}/api/users`,
    list: `${API_BASE_URL}/api/users`,
  },
  shops: {
    list: `${API_BASE_URL}/api/shops`,
    nearby: `${API_BASE_URL}/api/shops/nearby`,
    get: (id: string) => `${API_BASE_URL}/api/shops/${id}`,
    drinks: (id: string) => `${API_BASE_URL}/api/shops/${id}/drinks`,
    create: `${API_BASE_URL}/api/shops`,
  },
  feeds: {
    list: `${API_BASE_URL}/api/feeds`,
    get: (id: string) => `${API_BASE_URL}/api/feeds/${id}`,
    create: `${API_BASE_URL}/api/feeds`,
    like: (id: string) => `${API_BASE_URL}/api/feeds/${id}/like`,
    comment: (id: string) => `${API_BASE_URL}/api/feeds/${id}/comments`,
    delete: (id: string) => `${API_BASE_URL}/api/feeds/${id}`,
  },
  wishlists: {
    list: `${API_BASE_URL}/api/wishlists`,
    create: `${API_BASE_URL}/api/wishlists`,
    update: (id: string) => `${API_BASE_URL}/api/wishlists/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/wishlists/${id}`,
  },
  follows: {
    list: `${API_BASE_URL}/api/follows`,
    create: `${API_BASE_URL}/api/follows`,
    delete: `${API_BASE_URL}/api/follows`,
  },
  search: `${API_BASE_URL}/api/search`,
  chats: {
    list: `${API_BASE_URL}/api/chats`,
    get: (userId: string) => `${API_BASE_URL}/api/chats/${userId}`,
    send: `${API_BASE_URL}/api/chats`,
    unread: `${API_BASE_URL}/api/chats/unread`,
  },
  notifications: {
    list: `${API_BASE_URL}/api/notifications`,
    unreadCount: `${API_BASE_URL}/api/notifications/unread-count`,
    readAll: `${API_BASE_URL}/api/notifications/read-all`,
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('sintea_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '请求失败' }));
      throw new Error(error.message || '请求失败');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('网络请求超时，请检查网络连接');
    }
    if (error instanceof TypeError) {
      throw new Error('网络连接失败，请检查网络');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const setToken = (token: string) => {
  localStorage.setItem('sintea_token', token);
};

export const getToken = () => {
  return localStorage.getItem('sintea_token');
};

export const removeToken = () => {
  localStorage.removeItem('sintea_token');
};