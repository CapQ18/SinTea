// 用户路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

export function registerRoutes(router: Router): void {
  // GET /api/users — 用户列表
  router.get('/api/users', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const results = await db
      .prepare('SELECT id, username, nickname, avatar, bio FROM users LIMIT 50')
      .all();

    return ok({ users: results.results });
  });

  // GET /api/users/:id — 用户详情
  router.get('/api/users/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return error('无效的用户ID', 400);

    const user = await db
      .prepare(
        'SELECT id, username, nickname, avatar, bio, createdAt FROM users WHERE id = ?',
      )
      .bind(userId)
      .first();

    if (!user) {
      return error('用户不存在', 404);
    }

    // 查询该用户的动态数和获赞数
    const feedCount = (await db
      .prepare('SELECT COUNT(*) as count FROM feeds WHERE userId = ?')
      .bind(userId)
      .first()) as any;

    const likeCount = (await db
      .prepare(
        'SELECT COUNT(*) as count FROM likes l JOIN feeds f ON l.feedId = f.id WHERE f.userId = ?',
      )
      .bind(userId)
      .first()) as any;

    return ok({
      user: {
        ...(user as any),
        feedsCount: feedCount?.count || 0,
        likesCount: likeCount?.count || 0,
      },
    });
  });

  // PUT /api/users — 更新当前用户资料
  router.put('/api/users', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { nickname, avatar, bio } = body;

    const result = await db
      .prepare(
        'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE id = ?',
      )
      .bind(nickname || null, avatar || null, bio || null, auth.userId)
      .run();

    if (result.changes === 0) {
      return error('更新失败', 500);
    }

    const updatedUser = await db
      .prepare('SELECT id, username, email, nickname, avatar, bio FROM users WHERE id = ?')
      .bind(auth.userId)
      .first();

    return ok({ user: updatedUser });
  });
}
