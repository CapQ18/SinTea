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

    // 计算口味画像（6维评分平均值）
    const tasteProfile = (await db
      .prepare(
        'SELECT AVG(sweetness) as sweetness, AVG(tea) as tea, AVG(milk) as milk, AVG(taste) as taste, AVG(coolness) as coolness, AVG(appearance) as appearance FROM feeds WHERE userId = ?',
      )
      .bind(userId)
      .first()) as any;

    return ok({
      user: {
        ...(user as any),
        feedsCount: feedCount?.count || 0,
        likesCount: likeCount?.count || 0,
        tasteProfile: tasteProfile?.sweetness != null ? {
          sweetness: Math.round(tasteProfile.sweetness),
          tea: Math.round(tasteProfile.tea),
          milk: Math.round(tasteProfile.milk),
          taste: Math.round(tasteProfile.taste),
          coolness: Math.round(tasteProfile.coolness),
          appearance: Math.round(tasteProfile.appearance),
        } : null,
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

  // GET /api/users/:id/feeds — 用户的动态列表（分页）
  router.get('/api/users/:id/feeds', async (request, env, params) => {
    const db = env.DB;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return error('无效的用户ID', 400);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20);
    const offset = (page - 1) * limit;

    const results = await db
      .prepare(
        'SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id WHERE f.userId = ? ORDER BY f.createdAt DESC LIMIT ? OFFSET ?',
      )
      .bind(userId, limit, offset)
      .all();

    const total = (await db
      .prepare('SELECT COUNT(*) as count FROM feeds WHERE userId = ?')
      .bind(userId)
      .first()) as any;

    const feeds = (results.results as any[]).map((f: any) => ({
      ...f,
      images: f.images ? JSON.parse(f.images) : [],
    }));

    return ok({
      feeds,
      total: total?.count || 0,
      page,
      limit,
      hasMore: offset + limit < (total?.count || 0),
    });
  });
}
