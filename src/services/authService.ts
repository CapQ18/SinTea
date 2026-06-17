import { User, LoginFormData, RegisterFormData } from '../types/user';
import { API, request, setToken, removeToken } from './apiService';

const CURRENT_USER_KEY = 'sintea_current_user';

export const initTestUsers = (): void => {
};

export const getAllUsers = async (): Promise<User[]> => {
  return request<User[]>(API.users.list);
};

export const register = async (formData: RegisterFormData): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const data = await request<{ success: boolean; message: string; user?: User }>(API.auth.register, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '注册失败' };
  }
};

export const login = async (formData: LoginFormData): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const data = await request<{ success: boolean; message: string; user?: User; token?: string }>(API.auth.login, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    if (data.success && data.token) {
      setToken(data.token);
      if (data.user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '登录失败' };
  }
};

export const logout = (): void => {
  removeToken();
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem(CURRENT_USER_KEY) !== null;
};

export const getProfile = async (): Promise<User | null> => {
  try {
    const data = await request<{ success: boolean; user?: User }>(API.auth.me);
    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};

export const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const data = await request<{ success: boolean; message: string; user?: User }>(API.users.update, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '更新失败' };
  }
};