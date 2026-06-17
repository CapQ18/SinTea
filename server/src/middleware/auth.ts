import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sintea_secret_key_2026';

export interface UserPayload {
  id: number;
  username: string;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ success: false, message: '未登录' }, 401);
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ success: false, message: 'token无效' }, 401);
  }
};

export const generateToken = (user: { id: number; username: string }) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
};