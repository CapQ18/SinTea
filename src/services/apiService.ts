const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction 
  ? 'https://sintea-api.xxx.workers.dev' 
  : 'http://localhost:8787';

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
  },
  wishlists: {
    list: `${API_BASE_URL}/api/wishlists`,
    create: `${API_BASE_URL}/api/wishlists`,
    update: (id: string) => `${API_BASE_URL}/api/wishlists/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/wishlists/${id}`,
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
  const response = await fetch(url, {
    ...options,
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