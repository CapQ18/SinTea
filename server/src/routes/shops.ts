import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const shops = new Hono();

shops.get('/', async (c) => {
  const db = c.env.D1_DB;
  
  try {
    const results = await db.prepare(
      'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops'
    ).all();
    
    return c.json({ success: true, shops: results.results });
  } catch (error) {
    return c.json({ success: false, message: '获取店铺列表失败' }, 500);
  }
});

shops.get('/nearby', async (c) => {
  const db = c.env.D1_DB;
  const { lat, lng, radius = 10 } = c.req.query();
  
  if (!lat || !lng) {
    return c.json({ success: false, message: '缺少位置参数' }, 400);
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxDistance = parseFloat(radius);
  
  try {
    const results = await db.prepare(
      'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops'
    ).all();
    
    const shopsWithDistance = results.results.map((shop: any) => {
      if (shop.latitude && shop.longitude) {
        const R = 6371;
        const dLat = (shop.latitude - latitude) * Math.PI / 180;
        const dLng = (shop.longitude - longitude) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(latitude * Math.PI / 180) * Math.cos(shop.latitude * Math.PI / 180) *
                  Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = Math.round(R * c * 100) / 100;
        return { ...shop, distance };
      }
      return { ...shop, distance: null };
    }).filter((shop: any) => shop.distance !== null && shop.distance <= maxDistance)
      .sort((a: any, b: any) => a.distance - b.distance);
    
    return c.json({ success: true, shops: shopsWithDistance, count: shopsWithDistance.length });
  } catch (error) {
    return c.json({ success: false, message: '获取附近店铺失败' }, 500);
  }
});

shops.get('/:id', async (c) => {
  const db = c.env.D1_DB;
  const shopId = parseInt(c.req.param('id'));
  
  try {
    const shop = await db.prepare(
      'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops WHERE id = ?'
    ).bind(shopId).first();
    
    if (!shop) {
      return c.json({ success: false, message: '店铺不存在' }, 404);
    }
    
    const drinks = await db.prepare(
      'SELECT id, name, category, price, description, rating, imageUrl FROM drinks WHERE shopId = ?'
    ).bind(shopId).all();
    
    return c.json({ success: true, shop, drinks: drinks.results });
  } catch (error) {
    return c.json({ success: false, message: '获取店铺信息失败' }, 500);
  }
});

shops.get('/:id/drinks', async (c) => {
  const db = c.env.D1_DB;
  const shopId = parseInt(c.req.param('id'));
  
  try {
    const results = await db.prepare(
      'SELECT id, name, category, price, description, rating, imageUrl FROM drinks WHERE shopId = ?'
    ).bind(shopId).all();
    
    return c.json({ success: true, drinks: results.results });
  } catch (error) {
    return c.json({ success: false, message: '获取饮品列表失败' }, 500);
  }
});

shops.post('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const body = await c.req.json();
  const { name, brand, description, address, latitude, longitude, rating, priceRange } = body;
  
  try {
    const result = await db.prepare(
      'INSERT INTO shops (name, brand, description, address, latitude, longitude, rating, priceRange) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(name, brand, description, address, latitude, longitude, rating, priceRange).run();
    
    const shopId = Number(result.lastInsertRowid);
    return c.json({ success: true, shopId });
  } catch (error) {
    return c.json({ success: false, message: '创建店铺失败' }, 500);
  }
});

export default shops;