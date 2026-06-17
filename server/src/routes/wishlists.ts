import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const wishlists = new Hono();

wishlists.get('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  
  try {
    const results = await db.prepare(
      'SELECT id, drinkName, shopName, category, imageUrl, isDrank, addedAt FROM wishlists WHERE userId = ? ORDER BY addedAt DESC'
    ).bind(user.id).all();
    
    return c.json({ success: true, wishlists: results.results });
  } catch (error) {
    return c.json({ success: false, message: '获取心愿单失败' }, 500);
  }
});

wishlists.post('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const body = await c.req.json();
  const { drinkName, shopName, category, imageUrl } = body;
  
  try {
    const result = await db.prepare(
      'INSERT INTO wishlists (userId, drinkName, shopName, category, imageUrl, isDrank) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(user.id, drinkName, shopName, category || '奶茶', imageUrl || '', 0).run();
    
    const wishlistId = Number(result.lastInsertRowid);
    return c.json({ success: true, wishlistId });
  } catch (error) {
    return c.json({ success: false, message: '添加心愿单失败' }, 500);
  }
});

wishlists.put('/:id', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const wishlistId = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { isDrank } = body;
  
  try {
    const result = await db.prepare(
      'UPDATE wishlists SET isDrank = ? WHERE id = ? AND userId = ?'
    ).bind(isDrank ? 1 : 0, wishlistId, user.id).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, message: '更新失败' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: '更新失败' }, 500);
  }
});

wishlists.delete('/:id', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const wishlistId = parseInt(c.req.param('id'));
  
  try {
    const result = await db.prepare(
      'DELETE FROM wishlists WHERE id = ? AND userId = ?'
    ).bind(wishlistId, user.id).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, message: '删除失败' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: '删除失败' }, 500);
  }
});

export default wishlists;