// 动态路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';
import { createNotification } from './notifications';

export function registerRoutes(router: Router): void {
  // GET /api/feeds — 动态列表（支持分页和排序）
  router.get('/api/feeds', async (request, env) => {
    const db = env.DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const sort = url.searchParams.get('sort') || 'new'; // 'new' | 'hot'

    const orderBy = sort === 'hot'
      ? 'f.likes DESC, f.createdAt DESC'
      : 'f.createdAt DESC';

    const results = await db
      .prepare(
        `SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      )
      .bind(limit, offset)
      .all();

	    // 获取总数用于分页
	    const countResult = (await db
	      .prepare('SELECT COUNT(*) as total FROM feeds')
	      .first()) as any;

	    const feedsWithData = await Promise.all(
	      (results.results as any[]).map(async (feed: any) => {
	        const comments = await db
	          .prepare(
	            'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC',
	          )
	          .bind(feed.id)
	          .all();

	        const likeCount = (await db
	          .prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?')
	          .bind(feed.id)
	          .first()) as any;

	        // 列表不返回 base64 图片数据，只返回数量（减小响应体积）
	        let imageCount = 0;
	        if (feed.images) {
	          try {
	            const imgs = JSON.parse(feed.images);
	            imageCount = Array.isArray(imgs) ? imgs.length : 0;
	          } catch { /* ignore */ }
	        }

	        return {
	          ...feed,
	          images: undefined,     // 列表不传图片数据
	          imageCount,            // 只传数量
	          comments: comments.results,
	          likes: likeCount?.count || 0,
	        };
	      }),
	    );

    return ok({
      feeds: feedsWithData,
      total: countResult?.total || 0,
      page,
      limit,
      sort,
      hasMore: offset + limit < (countResult?.total || 0),
    });
  });

  // GET /api/feeds/:id — 动态详情
  router.get('/api/feeds/:id', async (request, env, params) => {
    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const feed = (await db
      .prepare(
        'SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id WHERE f.id = ?',
      )
      .bind(feedId)
      .first()) as any;

    if (!feed) {
      return error('动态不存在', 404);
    }

    const comments = await db
      .prepare(
        'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC',
      )
      .bind(feedId)
      .all();

    const likeCount = (await db
      .prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?')
      .bind(feedId)
      .first()) as any;

    return ok({
      feed: {
        ...feed,
        images: feed.images ? JSON.parse(feed.images) : [],
        comments: comments.results,
        likes: likeCount?.count || 0,
      },
    });
  });

  // POST /api/feeds — 发布动态
  router.post('/api/feeds', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const {
      shopName,
      drinkName,
      content,
      type,
      rating,
      images,
      sweetness,
      tea,
      milk,
      taste,
      coolness,
      appearance,
    } = body;

    const imagesJson = images ? JSON.stringify(images) : null;

    // 限制图片总大小：单张 base64 不超过 200KB，总计不超过 1MB
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (typeof img === 'string' && img.length > 280000) { // ~200KB base64
          return error('图片过大，请选择更小的图片或降低质量', 400);
        }
      }
      if (imagesJson && imagesJson.length > 1200000) { // ~1MB total
        return error('图片总大小超过限制，请减少图片数量', 400);
      }
    }

    const result = await db
      .prepare(
        'INSERT INTO feeds (userId, shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        auth.userId,
        shopName || '',
        drinkName || '',
        content || '',
        type || 'neutral',
        rating || 3,
        imagesJson,
        sweetness || 50,
        tea || 50,
        milk || 50,
        taste || 50,
        coolness || 50,
        appearance || 50,
      )
      .run();

    return ok({ feedId: Number(result.lastInsertRowid) });
  });

  // POST /api/feeds/:id/like — 点赞/取消点赞
  router.post('/api/feeds/:id/like', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const existing = await db
      .prepare('SELECT id FROM likes WHERE userId = ? AND feedId = ?')
      .bind(auth.userId, feedId)
      .first();

    let liked: boolean;

    if (existing) {
      await db
        .prepare('DELETE FROM likes WHERE userId = ? AND feedId = ?')
        .bind(auth.userId, feedId)
        .run();
      liked = false;
    } else {
      await db
        .prepare('INSERT INTO likes (userId, feedId) VALUES (?, ?)')
        .bind(auth.userId, feedId)
        .run();
      liked = true;

      // 通知动态作者
      const feedAuthor = (await db
        .prepare('SELECT userId FROM feeds WHERE id = ?')
        .bind(feedId)
        .first()) as any;
      if (feedAuthor) {
        await createNotification(db, 'like', feedAuthor.userId, auth.userId, { feedId });
      }
    }

    // 同步更新 feeds 表的 likes 计数
    const likeCount = (await db
      .prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?')
      .bind(feedId)
      .first()) as any;
    await db
      .prepare('UPDATE feeds SET likes = ? WHERE id = ?')
      .bind(likeCount?.count || 0, feedId)
      .run();

    return ok({ liked, likes: likeCount?.count || 0 });
  });

  // POST /api/feeds/:id/comments — 发表评论
  router.post('/api/feeds/:id/comments', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const body: any = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return error('评论内容不能为空', 400);
    }

    const result = await db
      .prepare('INSERT INTO comments (feedId, userId, content) VALUES (?, ?, ?)')
      .bind(feedId, auth.userId, content.trim())
      .run();

    // 通知动态作者
    const feedAuthor = (await db
      .prepare('SELECT userId FROM feeds WHERE id = ?')
      .bind(feedId)
      .first()) as any;
    if (feedAuthor) {
      await createNotification(db, 'comment', feedAuthor.userId, auth.userId, {
        feedId,
        commentContent: content.trim().substring(0, 100),
      });
    }

    return ok({ commentId: Number(result.lastInsertRowid) });
  });

  // DELETE /api/feeds/:id — 删除自己的动态
  router.delete('/api/feeds/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const feed = (await db
      .prepare('SELECT userId FROM feeds WHERE id = ?')
      .bind(feedId)
      .first()) as any;

    if (!feed) return error('动态不存在', 404);
    if (feed.userId !== auth.userId) return error('只能删除自己的动态', 403);

    // 删除关联数据
    await db.prepare('DELETE FROM likes WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM comments WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM notifications WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM feeds WHERE id = ?').bind(feedId).run();

    return ok({});
  });
}
