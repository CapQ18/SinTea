import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const feeds = new Hono();

feeds.get('/', async (c) => {
  const db = c.env.D1_DB;
  const { page = 1, limit = 20 } = c.req.query();
  
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const results = await db.prepare(
      'SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id ORDER BY f.createdAt DESC LIMIT ? OFFSET ?'
    ).bind(parseInt(limit), offset).all();
    
    const feedsWithComments = await Promise.all(
      results.results.map(async (feed: any) => {
        const comments = await db.prepare(
          'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC'
        ).bind(feed.id).all();
        
        const likeCount = await db.prepare(
          'SELECT COUNT(*) as count FROM likes WHERE feedId = ?'
        ).bind(feed.id).first();
        
        return {
          ...feed,
          images: feed.images ? JSON.parse(feed.images) : [],
          comments: comments.results,
          likes: likeCount ? (likeCount as any).count : 0
        };
      })
    );
    
    return c.json({ success: true, feeds: feedsWithComments });
  } catch (error) {
    return c.json({ success: false, message: '获取动态列表失败' }, 500);
  }
});

feeds.get('/:id', async (c) => {
  const db = c.env.D1_DB;
  const feedId = parseInt(c.req.param('id'));
  
  try {
    const feed = await db.prepare(
      'SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id WHERE f.id = ?'
    ).bind(feedId).first();
    
    if (!feed) {
      return c.json({ success: false, message: '动态不存在' }, 404);
    }
    
    const comments = await db.prepare(
      'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC'
    ).bind(feedId).all();
    
    const likeCount = await db.prepare(
      'SELECT COUNT(*) as count FROM likes WHERE feedId = ?'
    ).bind(feedId).first();
    
    return c.json({
      success: true,
      feed: {
        ...feed,
        images: (feed as any).images ? JSON.parse((feed as any).images) : [],
        comments: comments.results,
        likes: likeCount ? (likeCount as any).count : 0
      }
    });
  } catch (error) {
    return c.json({ success: false, message: '获取动态详情失败' }, 500);
  }
});

feeds.post('/', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const body = await c.req.json();
  const { shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance } = body;
  
  try {
    const imagesJson = images ? JSON.stringify(images) : null;
    
    const result = await db.prepare(
      'INSERT INTO feeds (userId, shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.id, shopName, drinkName, content, type || 'neutral', rating || 3, imagesJson, sweetness || 50, tea || 50, milk || 50, taste || 50, coolness || 50, appearance || 50).run();
    
    const feedId = Number(result.lastInsertRowid);
    return c.json({ success: true, feedId });
  } catch (error) {
    return c.json({ success: false, message: '发布动态失败' }, 500);
  }
});

feeds.post('/:id/like', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const feedId = parseInt(c.req.param('id'));
  
  try {
    const existingLike = await db.prepare(
      'SELECT id FROM likes WHERE userId = ? AND feedId = ?'
    ).bind(user.id, feedId).first();
    
    if (existingLike) {
      await db.prepare('DELETE FROM likes WHERE userId = ? AND feedId = ?').bind(user.id, feedId).run();
      
      const likeCount = await db.prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?').bind(feedId).first();
      await db.prepare('UPDATE feeds SET likes = ? WHERE id = ?').bind(likeCount ? (likeCount as any).count : 0, feedId).run();
      
      return c.json({ success: true, liked: false });
    } else {
      await db.prepare('INSERT INTO likes (userId, feedId) VALUES (?, ?)').bind(user.id, feedId).run();
      
      const likeCount = await db.prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?').bind(feedId).first();
      await db.prepare('UPDATE feeds SET likes = ? WHERE id = ?').bind(likeCount ? (likeCount as any).count : 0, feedId).run();
      
      return c.json({ success: true, liked: true });
    }
  } catch (error) {
    return c.json({ success: false, message: '点赞失败' }, 500);
  }
});

feeds.post('/:id/comments', authMiddleware, async (c) => {
  const db = c.env.D1_DB;
  const user = c.get('user') as { id: number };
  const feedId = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { content } = body;
  
  try {
    const result = await db.prepare(
      'INSERT INTO comments (feedId, userId, content) VALUES (?, ?, ?)'
    ).bind(feedId, user.id, content).run();
    
    const commentId = Number(result.lastInsertRowid);
    return c.json({ success: true, commentId });
  } catch (error) {
    return c.json({ success: false, message: '评论失败' }, 500);
  }
});

export default feeds;