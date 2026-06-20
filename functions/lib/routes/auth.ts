// 认证路由：注册 / 登录 / 获取当前用户

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { hashPassword, verifyPassword, generateToken } from '../crypto';
import { requireAuth } from '../middleware';

function getSecret(env: Env): string {
  return env.JWT_SECRET || 'sintea_jwt_secret_change_me';
}

export function registerRoutes(router: Router): void {
  // POST /api/auth/register
  router.post('/api/auth/register', async (request, env) => {
    const db = env.DB;
    const body: any = await request.json();
    const { username, email, password, confirmPassword, nickname } = body;

    if (!username || !email || !password) {
      return error('请填写完整信息', 400);
    }

    if (password !== confirmPassword) {
      return error('两次密码不一致', 400);
    }

    // 检查是否已存在
    const existing = await db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first();

    if (existing) {
      return error('用户名或邮箱已存在', 400);
    }

    const hashed = await hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    const result = await db
      .prepare(
        'INSERT INTO users (username, email, password, nickname, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(username, email, hashed, nickname || username, avatar, '')
      .run();

    const userId = Number(result.lastInsertRowid);
    const token = await generateToken({ id: userId, username }, getSecret(env));

    return ok({
      message: '注册成功',
      token,
      user: { id: userId, username, email, nickname: nickname || username, avatar },
    });
  });

  // POST /api/auth/login
  router.post('/api/auth/login', async (request, env) => {
    const db = env.DB;
    const body: any = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return error('请填写用户名和密码', 400);
    }

    const user = (await db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first()) as any;

    if (!user) {
      return error('用户不存在', 400);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return error('密码错误', 400);
    }

    const token = await generateToken(
      { id: user.id, username: user.username },
      getSecret(env),
    );

    return ok({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  });

  // GET /api/auth/me
  router.get('/api/auth/me', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const user = await db
      .prepare(
        'SELECT id, username, email, nickname, avatar, bio, createdAt FROM users WHERE id = ?',
      )
      .bind(auth.userId)
      .first();

    if (!user) {
      return error('用户不存在', 404);
    }

    return ok({ user });
  });
}
