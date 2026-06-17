import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { generateToken, authMiddleware } from '../middleware/auth';

const auth = new Hono();

auth.post('/register', async (c) => {
  const db = c.env.D1_DB;
  const body = await c.req.json();
  const { username, email, password, confirmPassword, nickname } = body;
  
  if (!username || !email || !password) {
    return c.json({ success: false, message: '请填写完整信息' }, 400);
  }
  
  if (password !== confirmPassword) {
    return c.json({ success: false, message: '两次密码不一致' }, 400);
  }
  
  try {
    const existingUser = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first();
    
    if (existingUser) {
      return c.json({ success: false, message: '用户名或邮箱已存在' }, 400);
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    
    const result = await db.prepare(
      'INSERT INTO users (username, email, password, nickname, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(username, email, hashedPassword, nickname || username, avatar, '').run();
    
    const userId = Number(result.lastInsertRowid);
    const token = generateToken({ id: userId, username });
    
    return c.json({
      success: true,
      message: '注册成功',
      token,
      user: { id: userId, username, email, nickname: nickname || username, avatar }
    });
  } catch (error) {
    return c.json({ success: false, message: '注册失败' }, 500);
  }
});

auth.post('/login', async (c) => {
  const db = c.env.D1_DB;
  const body = await c.req.json();
  const { username, password } = body;
  
  try {
    const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    if (!user) {
      return c.json({ success: false, message: '用户不存在' }, 400);
    }
    
    const isValid = bcrypt.compareSync(password, (user as any).password);
    
    if (!isValid) {
      return c.json({ success: false, message: '密码错误' }, 400);
    }
    
    const token = generateToken({ id: (user as any).id, username });
    
    return c.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: (user as any).id,
        username: (user as any).username,
        email: (user as any).email,
        nickname: (user as any).nickname,
        avatar: (user as any).avatar,
        bio: (user as any).bio
      }
    });
  } catch (error) {
    return c.json({ success: false, message: '登录失败' }, 500);
  }
});

auth.get('/me', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  
  try {
    const result = await db.prepare(
      'SELECT id, username, email, nickname, avatar, bio, createdAt FROM users WHERE id = ?'
    ).bind(user.id).first();
    
    if (!result) {
      return c.json({ success: false, message: '用户不存在' }, 404);
    }
    
    return c.json({ success: true, user: result });
  } catch (error) {
    return c.json({ success: false, message: '获取用户信息失败' }, 500);
  }
});

export default auth;