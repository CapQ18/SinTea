// 关注路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

export function registerRoutes(router: Router): void {
  // GET /api/follows — 我的关注列表
  router.get('/api/follows', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const results = await db
      .prepare(
        'SELECT f.targetUserId as id, u.username, u.nickname, u.avatar FROM follows f JOIN users u ON f.targetUserId = u.id WHERE f.userId = ?',
      )
      .bind(auth.userId)
      .all();

    return ok({ follows: results.results });
  });

  // POST /api/follows — 关注用户
  router.post('/api/follows', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { targetUserId } = body;

    if (!targetUserId || auth.userId === targetUserId) {
      return error('无效的关注目标', 400);
    }

    // 检查目标用户是否存在
    const target = await db
      .prepare('SELECT id FROM users WHERE id = ?')
      .bind(targetUserId)
      .first();
    if (!target) {
      return error('目标用户不存在', 404);
    }

    // 检查是否已关注
    const existing = await db
      .prepare('SELECT id FROM follows WHERE userId = ? AND targetUserId = ?')
      .bind(auth.userId, targetUserId)
      .first();

    if (existing) {
      return error('已关注该用户', 400);
    }

    await db
      .prepare('INSERT INTO follows (userId, targetUserId) VALUES (?, ?)')
      .bind(auth.userId, targetUserId)
      .run();

    return ok({});
  });

  // DELETE /api/follows — 取消关注
  router.delete('/api/follows', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return error('请指定取消关注的用户', 400);
    }

    await db
      .prepare('DELETE FROM follows WHERE userId = ? AND targetUserId = ?')
      .bind(auth.userId, targetUserId)
      .run();

    return ok({});
  });
}
