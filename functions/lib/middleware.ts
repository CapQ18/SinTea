// 认证中间件 — 从 Authorization header 提取并验证 JWT

import type { Env } from './env';
import { verifyToken, JwtPayload } from './crypto';
import { error } from './response';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  username?: string;
}

export async function requireAuth(
  request: Request,
  env: Env,
): Promise<{ userId: number; username: string } | Response> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return error('未登录，请先登录', 401);
  }

  const secret = env.JWT_SECRET || 'sintea_jwt_secret_change_me';
  const payload = await verifyToken(token, secret);

  if (!payload) {
    return error('登录已过期，请重新登录', 401);
  }

  return { userId: payload.id, username: payload.username };
}

// 可选认证 — 不强制要求登录，但如果有 token 就解析
export async function optionalAuth(
  request: Request,
  env: Env,
): Promise<{ userId: number; username: string } | null> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return null;

  const secret = env.JWT_SECRET || 'sintea_jwt_secret_change_me';
  const payload = await verifyToken(token, secret);

  if (!payload) return null;

  return { userId: payload.id, username: payload.username };
}
