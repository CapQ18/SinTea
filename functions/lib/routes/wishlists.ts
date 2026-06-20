// 心愿单路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

export function registerRoutes(router: Router): void {
  // GET /api/wishlists — 我的心愿单列表
  router.get('/api/wishlists', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const results = await db
      .prepare(
        'SELECT id, drinkName, shopName, category, imageUrl, isDrank, addedAt FROM wishlists WHERE userId = ? ORDER BY addedAt DESC',
      )
      .bind(auth.userId)
      .all();

    return ok({ wishlists: results.results });
  });

  // POST /api/wishlists — 添加心愿单
  router.post('/api/wishlists', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { drinkName, shopName, category, imageUrl } = body;

    if (!drinkName) {
      return error('饮品名称不能为空', 400);
    }

    const result = await db
      .prepare(
        'INSERT INTO wishlists (userId, drinkName, shopName, category, imageUrl, isDrank) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(auth.userId, drinkName, shopName || '', category || '奶茶', imageUrl || '', 0)
      .run();

    return ok({ wishlistId: Number(result.lastInsertRowid) });
  });

  // PUT /api/wishlists/:id — 标记已喝/未喝
  router.put('/api/wishlists/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const wishlistId = parseInt(params.id);
    if (isNaN(wishlistId)) return error('无效的心愿单ID', 400);

    const body: any = await request.json();
    const { isDrank } = body;

    const result = await db
      .prepare('UPDATE wishlists SET isDrank = ? WHERE id = ? AND userId = ?')
      .bind(isDrank ? 1 : 0, wishlistId, auth.userId)
      .run();

    if (result.changes === 0) {
      return error('更新失败，心愿单不存在或不属于你', 400);
    }

    return ok({});
  });

  // DELETE /api/wishlists/:id — 删除心愿单
  router.delete('/api/wishlists/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const wishlistId = parseInt(params.id);
    if (isNaN(wishlistId)) return error('无效的心愿单ID', 400);

    const result = await db
      .prepare('DELETE FROM wishlists WHERE id = ? AND userId = ?')
      .bind(wishlistId, auth.userId)
      .run();

    if (result.changes === 0) {
      return error('删除失败，心愿单不存在或不属于你', 400);
    }

    return ok({});
  });
}
