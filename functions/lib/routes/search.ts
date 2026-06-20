// 搜索路由

import type { Router } from '../router';
import { ok, error } from '../response';

export function registerRoutes(router: Router): void {
  // GET /api/search?q=xxx&type=all|feeds|shops|drinks&page=1&limit=20
  router.get('/api/search', async (request, env) => {
    const db = env.DB;
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();
    const type = url.searchParams.get('type') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    if (!q) {
      return error('请输入搜索关键词', 400);
    }

    const searchTerm = `%${q}%`;
    const results: Record<string, any[]> = {};

    // 搜索动态
    if (type === 'all' || type === 'feeds') {
      const feeds = await db
        .prepare(
          `SELECT f.id, f.content, f.drinkName, f.shopName, f.type, f.rating, f.likes,
                  f.createdAt, f.images,
                  u.username, u.nickname, u.avatar
           FROM feeds f
           JOIN users u ON f.userId = u.id
           WHERE f.content LIKE ? OR f.drinkName LIKE ? OR f.shopName LIKE ?
           ORDER BY f.createdAt DESC
           LIMIT ?`,
        )
        .bind(searchTerm, searchTerm, searchTerm, limit)
        .all();

      results.feeds = (feeds.results as any[]).map((f: any) => ({
        ...f,
        images: f.images ? JSON.parse(f.images) : [],
      }));
    }

    // 搜索店铺
    if (type === 'all' || type === 'shops') {
      const shops = await db
        .prepare(
          `SELECT id, name, brand, description, address, rating, priceRange
           FROM shops
           WHERE name LIKE ? OR brand LIKE ? OR description LIKE ? OR address LIKE ?
           LIMIT ?`,
        )
        .bind(searchTerm, searchTerm, searchTerm, searchTerm, limit)
        .all();

      results.shops = (shops.results as any[]).map((s: any) => ({
        ...s,
        id: String(s.id),
      }));
    }

    // 搜索饮品
    if (type === 'all' || type === 'drinks') {
      const drinks = await db
        .prepare(
          `SELECT d.id, d.name, d.category, d.price, d.description, d.rating, d.imageUrl,
                  s.name as shopName, s.id as shopId
           FROM drinks d
           JOIN shops s ON d.shopId = s.id
           WHERE d.name LIKE ? OR d.description LIKE ? OR d.category LIKE ?
           LIMIT ?`,
        )
        .bind(searchTerm, searchTerm, searchTerm, limit)
        .all();

      results.drinks = (drinks.results as any[]).map((d: any) => ({
        ...d,
        shopId: String(d.shopId),
      }));
    }

    return ok({ query: q, type, results });
  });
}
