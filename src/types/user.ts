export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  nickname: string;
  bio: string;
  createdAt: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}