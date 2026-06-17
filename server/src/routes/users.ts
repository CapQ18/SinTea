import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const users = new Hono();

users.get('/:id', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const userId = parseInt(c.req.param('id'));
  
  try {
    const user = await db.prepare(
      'SELECT id, username, nickname, avatar, bio, createdAt FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }
    
    return c.json({ success: true, user });
  } catch (error) {
    return c.json({ success: false, message: '获取用户信息失败' }, 500);
  }
});

users.put('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const body = await c.req.json();
  const { nickname, bio, avatar } = body;
  
  try {
    const result = await db.prepare(
      'UPDATE users SET nickname = COALESCE(?, nickname), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar) WHERE id = ?'
    ).bind(nickname, bio, avatar, user.id).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, message: '更新失败' }, 500);
    }
    
    const updatedUser = await db.prepare(
      'SELECT id, username, email, nickname, avatar, bio FROM users WHERE id = ?'
    ).bind(user.id).first();
    
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    return c.json({ success: false, message: '更新失败' }, 500);
  }
});

users.get('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  
  try {
    const results = await db.prepare(
      'SELECT id, username, nickname, avatar, bio FROM users LIMIT 20'
    ).all();
    
    return c.json({ success: true, users: results.results });
  } catch (error) {
    return c.json({ success: false, message: '获取用户列表失败' }, 500);
  }
});

export default users;