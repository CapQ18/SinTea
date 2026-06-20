// 店铺路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

// Haversine 公式计算两点距离（公里）
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// 获取店铺默认图片（临时方案，Phase 3 改为数据库存储）
function getDefaultImages(shopId: number): string[] {
  const map: Record<number, string[]> = {
    1: [
      'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    ],
    2: [
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      'https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400',
      'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
    ],
    3: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
      'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
    ],
    4: [
      'https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400',
      'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    ],
    5: [
      'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
    ],
  };
  return map[shopId] || map[1] || [];
}

export function registerRoutes(router: Router): void {
  // GET /api/shops — 店铺列表
  router.get('/api/shops', async (request, env) => {
    const db = env.DB;

    const results = await db
      .prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops',
      )
      .all();

    const shops = (results.results as any[]).map((shop) => ({
      ...shop,
      id: String(shop.id),
      images: getDefaultImages(shop.id),
    }));

    return ok({ shops });
  });

  // GET /api/shops/nearby — 附近店铺
  router.get('/api/shops/nearby', async (request, env) => {
    const db = env.DB;
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10');

    if (!lat && !lng) {
      return error('缺少位置参数', 400);
    }

    const results = await db
      .prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops',
      )
      .all();

    const shops = (results.results as any[])
      .map((shop) => {
        let distance: number | null = null;
        if (shop.latitude && shop.longitude) {
          distance = haversineDistance(lat, lng, shop.latitude, shop.longitude);
        }
        return {
          ...shop,
          id: String(shop.id),
          distance,
          images: getDefaultImages(shop.id),
        };
      })
      .filter((shop) => shop.distance !== null && shop.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return ok({ shops, count: shops.length });
  });

  // GET /api/shops/:id — 店铺详情 + 饮品列表
  router.get('/api/shops/:id', async (request, env, params) => {
    const db = env.DB;
    const shopId = parseInt(params.id);
    if (isNaN(shopId)) return error('无效的店铺ID', 400);

    const shop = (await db
      .prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops WHERE id = ?',
      )
      .bind(shopId)
      .first()) as any;

    if (!shop) {
      return error('店铺不存在', 404);
    }

    const drinks = await db
      .prepare(
        'SELECT id, name, category, price, description, rating, imageUrl FROM drinks WHERE shopId = ?',
      )
      .bind(shopId)
      .all();

    return ok({
      shop: {
        ...shop,
        id: String(shop.id),
        images: getDefaultImages(shop.id),
      },
      drinks: drinks.results,
    });
  });

  // GET /api/shops/:id/drinks — 店铺饮品列表
  router.get('/api/shops/:id/drinks', async (request, env, params) => {
    const db = env.DB;
    const shopId = parseInt(params.id);
    if (isNaN(shopId)) return error('无效的店铺ID', 400);

    const results = await db
      .prepare(
        'SELECT id, name, category, price, description, rating, imageUrl FROM drinks WHERE shopId = ?',
      )
      .bind(shopId)
      .all();

    return ok({ drinks: results.results });
  });

  // POST /api/shops — 创建店铺
  router.post('/api/shops', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { name, brand, description, address, latitude, longitude, rating, priceRange } =
      body;

    if (!name) {
      return error('店铺名称不能为空', 400);
    }

    const result = await db
      .prepare(
        'INSERT INTO shops (name, brand, description, address, latitude, longitude, rating, priceRange) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        name,
        brand || '',
        description || '',
        address || '',
        latitude || null,
        longitude || null,
        rating || 0,
        priceRange || '',
      )
      .run();

    return ok({ shopId: Number(result.lastInsertRowid) });
  });
}
