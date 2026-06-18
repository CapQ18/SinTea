import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const shops = new Hono();

// 根据店铺ID返回对应的图片列表
function getShopImages(shopId: number): string[] {
  const imageMap: Record<number, string[]> = {
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
  return imageMap[shopId] || imageMap[1];
}

shops.get('/', async (c) => {
  const db = c.env.D1_DB;
  
  try {
    const results = await db.prepare(
      'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops'
    ).all();
    
    // 为每个店铺添加图片（使用 mock 数据）
    const shopsWithImages = results.results.map((shop: any) => ({
      ...shop,
      id: String(shop.id),
      images: getShopImages(shop.id)
    }));
    
    return c.json({ success: true, shops: shopsWithImages });
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
        return { ...shop, id: String(shop.id), distance, images: getShopImages(shop.id) };
      }
      return { ...shop, id: String(shop.id), distance: null, images: getShopImages(shop.id) };
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
    
    const shopWithImages = {
      ...shop,
      id: String(shop.id),
      images: getShopImages(shop.id)
    };
    
    return c.json({ success: true, shop: shopWithImages, drinks: drinks.results });
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