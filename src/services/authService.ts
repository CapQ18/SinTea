import { User, LoginFormData, RegisterFormData } from '../types/user';

const STORAGE_KEY = 'sintea_users';
const CURRENT_USER_KEY = 'sintea_current_user';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const initTestUsers = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    const testUser: User = {
      id: 'test-user-id',
      username: 'test',
      email: 'test@example.com',
      password: '123456',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      nickname: '奶茶爱好者',
      bio: '每天一杯奶茶，快乐一整天！',
      createdAt: new Date().toISOString(),
    };
    saveUsers([testUser]);
  }
};

export const register = (formData: RegisterFormData): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  if (users.some(u => u.username === formData.username)) {
    return { success: false, message: '用户名已存在' };
  }
  
  if (users.some(u => u.email === formData.email)) {
    return { success: false, message: '邮箱已被注册' };
  }
  
  if (formData.password !== formData.confirmPassword) {
    return { success: false, message: '两次输入的密码不一致' };
  }
  
  const newUser: User = {
    id: generateId(),
    username: formData.username,
    email: formData.email,
    password: formData.password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
    nickname: formData.nickname || formData.username,
    bio: '',
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: '注册成功', user: newUser };
};

export const login = (formData: LoginFormData): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  const user = users.find(u => u.username === formData.username);
  
  if (!user) {
    return { success: false, message: '用户名不存在' };
  }
  
  if (user.password !== formData.password) {
    return { success: false, message: '密码错误' };
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return { success: true, message: '登录成功', user };
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem(CURRENT_USER_KEY) !== null;
};