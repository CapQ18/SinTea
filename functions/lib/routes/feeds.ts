// 动态路由（更新：XSS 净化 + 限流 + 输出过滤）

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';
import { createNotification } from './notifications';
import { sanitizePlainText, escapeHtml } from '../security/sanitize';
import { rateLimit, RATE_LIMIT_PRESETS } from '../security/rateLimit';

function safeAvatar(username: string, raw?: string): string {
  if (raw && !raw.startsWith('data:') && raw.length < 500) return raw;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

// 六维评分的合法取值范围
function clampScore(v: any, def = 50): number {
  const n = Number(v);
  if (Number.isNaN(n)) return def;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampRating(v: any): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}

const VALID_TYPES = new Set(['recommend', 'neutral', 'avoid']);
function sanitizeType(t: any): 'recommend' | 'neutral' | 'avoid' {
  return VALID_TYPES.has(t) ? t : 'neutral';
}

function parseImages(dbImages: any): { count: number; list: string[] } {
  try {
    const arr = dbImages ? JSON.parse(dbImages) : [];
    if (!Array.isArray(arr)) return { count: 0, list: [] };
    const list = arr.filter((x: any) => typeof x === 'string' && x.length > 0);
    return { count: list.length, list };
  } catch {
    return { count: 0, list: [] };
  }
}

function sanitizeComment(c: any): any {
  return {
    ...c,
    nickname: c.nickname ? escapeHtml(c.nickname) : c.nickname,
    username: c.username ? escapeHtml(c.username) : c.username,
    avatar: c.avatar ? safeAvatar(c.username, c.avatar) : safeAvatar(c.username || ''),
    content: c.content ? sanitizePlainText(c.content, 2000) : '',
  };
}

function enrichFeed(f: any, opts: { fullImages?: boolean; includeComments?: boolean } = {}) {
  const { count, list } = parseImages(f.images);
  const clean = {
    ...f,
    nickname: escapeHtml(f.nickname || ''),
    username: escapeHtml(f.username || ''),
    content: sanitizePlainText(f.content, 5000),
    shopName: f.shopName ? escapeHtml(f.shopName) : f.shopName,
    drinkName: f.drinkName ? escapeHtml(f.drinkName) : f.drinkName,
    type: sanitizeType(f.type),
    rating: clampRating(f.rating),
    sweetness: clampScore(f.sweetness, 50),
    tea: clampScore(f.tea, 50),
    milk: clampScore(f.milk, 50),
    taste: clampScore(f.taste, 50),
    coolness: clampScore(f.coolness, 50),
    appearance: clampScore(f.appearance, 50),
    featured: f.featured ? 1 : 0,
    avatar: safeAvatar(f.username),
    imageCount: count,
    images: opts.fullImages ? list : undefined,
  };
  return clean;
}

export function registerRoutes(router: Router): void {
  // GET /api/feeds — 动态列表（分页 + 排序）
  router.get('/api/feeds', async (request, env) => {
    const db = env.DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const sort = url.searchParams.get('sort') || 'new'; // new | hot | featured

    const where = sort === 'featured' ? 'WHERE f.featured = 1' : '';
    const orderBy = sort === 'hot'
      ? 'f.likes DESC, f.createdAt DESC'
      : 'f.createdAt DESC';

    const sql = `SELECT f.*, u.username, u.nickname FROM feeds f JOIN users u ON f.userId = u.id ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const results = await db.prepare(sql).bind(limit, offset).all();
    const countResult = (await db.prepare(`SELECT COUNT(*) as total FROM feeds f ${where}`).first()) as any;

    const ids: number[] = (results.results as any[]).map((r) => r.id);
    let commentsMap = new Map<number, any[]>();
    let likesMap = new Map<number, number>();

    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const allComments = await db
        .prepare(
          `SELECT c.*, u.username, u.nickname FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId IN (${placeholders}) ORDER BY c.createdAt DESC`
        )
        .bind(...ids)
        .all();
      for (const c of allComments.results as any[]) {
        const arr = commentsMap.get(c.feedId) || [];
        arr.push(sanitizeComment(c));
        commentsMap.set(c.feedId, arr);
      }
      const allLikes = (await db
        .prepare(`SELECT feedId, COUNT(*) as c FROM likes WHERE feedId IN (${placeholders}) GROUP BY feedId`)
        .bind(...ids)
        .all()).results as any[];
      for (const l of allLikes) likesMap.set(l.feedId, Number(l.c || 0));
    }

    const feeds = (results.results as any[]).map((f) => ({
      ...enrichFeed(f, { includeComments: false }),
      comments: commentsMap.get(f.id) || [],
      likes: likesMap.get(f.id) || 0,
    }));

    return ok({
      feeds,
      total: countResult?.total || 0,
      page,
      limit,
      sort,
      hasMore: offset + limit < (countResult?.total || 0),
    });
  });

  // GET /api/feeds/:id — 动态详情（返回完整图片 + 评论）
  router.get('/api/feeds/:id', async (request, env, params) => {
    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const feed = (await db
      .prepare('SELECT f.*, u.username, u.nickname FROM feeds f JOIN users u ON f.userId = u.id WHERE f.id = ?')
      .bind(feedId)
      .first()) as any;
    if (!feed) return error('动态不存在', 404);

    const comments = await db
      .prepare(
        'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC'
      )
      .bind(feedId)
      .all();

    const likeCount = (await db.prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?').bind(feedId).first()) as any;

    return ok({
      feed: {
        ...enrichFeed(feed, { fullImages: true }),
        comments: (comments.results as any[]).map(sanitizeComment),
        likes: likeCount?.count || 0,
      },
    });
  });

  // POST /api/feeds — 发布动态
  router.post('/api/feeds', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.post);
    if (rl.limited) return error(`发帖过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();

    const content = sanitizePlainText(body?.content, 5000);
    if (!content || content.length < 1) return error('动态内容不能为空', 400);

    const shopName = body?.shopName ? escapeHtml(body.shopName).slice(0, 50) : '';
    const drinkName = body?.drinkName ? escapeHtml(body.drinkName).slice(0, 50) : '';
    const type = sanitizeType(body?.type);
    const rating = clampRating(body?.rating);
    const sweetness = clampScore(body?.sweetness, 50);
    const tea = clampScore(body?.tea, 50);
    const milk = clampScore(body?.milk, 50);
    const taste = clampScore(body?.taste, 50);
    const coolness = clampScore(body?.coolness, 50);
    const appearance = clampScore(body?.appearance, 50);

    // 图片校验
    const rawImages: any[] = Array.isArray(body?.images) ? body.images : [];
    const safeImages: string[] = [];
    let totalLen = 0;
    for (const img of rawImages) {
      if (typeof img !== 'string') continue;
      // 只允许 data:image 或 https:// 开头
      if (!img.startsWith('data:image/') && !img.startsWith('https://')) continue;
      if (img.length > 280_000) return error('图片过大，请选择更小的图片', 400);
      safeImages.push(img);
      totalLen += img.length;
      if (safeImages.length >= 9) break; // 最多 9 张
    }
    if (totalLen > 1_200_000) return error('图片总大小超过限制，请减少数量', 400);

    const imagesJson = safeImages.length ? JSON.stringify(safeImages) : null;

    const result = await db
      .prepare(
        `INSERT INTO feeds (userId, shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        auth.userId,
        shopName,
        drinkName,
        content,
        type,
        rating,
        imagesJson,
        sweetness,
        tea,
        milk,
        taste,
        coolness,
        appearance,
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
      await db.prepare('DELETE FROM likes WHERE userId = ? AND feedId = ?').bind(auth.userId, feedId).run();
      liked = false;
    } else {
      await db.prepare('INSERT INTO likes (userId, feedId) VALUES (?, ?)').bind(auth.userId, feedId).run();
      liked = true;
      const feedAuthor = (await db.prepare('SELECT userId FROM feeds WHERE id = ?').bind(feedId).first()) as any;
      if (feedAuthor) await createNotification(db, 'like', feedAuthor.userId, auth.userId, { feedId });
    }

    const likeCount = (await db.prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?').bind(feedId).first()) as any;
    const likes = Number(likeCount?.count || 0);
    await db.prepare('UPDATE feeds SET likes = ? WHERE id = ?').bind(likes, feedId).run();

    return ok({ liked, likes });
  });

  // POST /api/feeds/:id/comments — 发表评论
  router.post('/api/feeds/:id/comments', async (request, env, params) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.comment);
    if (rl.limited) return error(`评论过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const body: any = await request.json();
    const content = sanitizePlainText(body?.content, 2000);
    if (!content) return error('评论内容不能为空', 400);

    const result = await db
      .prepare('INSERT INTO comments (feedId, userId, content) VALUES (?, ?, ?)')
      .bind(feedId, auth.userId, content)
      .run();

    const feedAuthor = (await db.prepare('SELECT userId FROM feeds WHERE id = ?').bind(feedId).first()) as any;
    if (feedAuthor && feedAuthor.userId !== auth.userId) {
      await createNotification(db, 'comment', Number(feedAuthor.userId), auth.userId, {
        feedId,
        commentContent: content.substring(0, 100),
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

    const feed = (await db.prepare('SELECT userId FROM feeds WHERE id = ?').bind(feedId).first()) as any;
    if (!feed) return error('动态不存在', 404);
    if (feed.userId !== auth.userId) return error('只能删除自己的动态', 403);

    await db.prepare('DELETE FROM likes WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM comments WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM notifications WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM feeds WHERE id = ?').bind(feedId).run();

    return ok({});
  });

  // DELETE /api/feeds/:id/comments/:commentId — 删除自己的评论
  router.delete('/api/feeds/:id/comments/:commentId', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    const commentId = parseInt(params.commentId);
    if (isNaN(feedId) || isNaN(commentId)) return error('无效的ID', 400);

    const comment = (await db.prepare('SELECT userId FROM comments WHERE id = ? AND feedId = ?').bind(commentId, feedId).first()) as any;
    if (!comment) return error('评论不存在', 404);
    if (comment.userId !== auth.userId) return error('只能删除自己的评论', 403);

    await db.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run();
    return ok({});
  });

  // PUT /api/feeds/:id — 编辑自己的动态
  router.put('/api/feeds/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const feedId = parseInt(params.id);
    if (isNaN(feedId)) return error('无效的动态ID', 400);

    const feed = (await db.prepare('SELECT userId FROM feeds WHERE id = ?').bind(feedId).first()) as any;
    if (!feed) return error('动态不存在', 404);
    if (feed.userId !== auth.userId) return error('只能编辑自己的动态', 403);

    const body: any = await request.json();
    const content = body?.content != null ? sanitizePlainText(body.content, 5000) : undefined;
    const rating = body?.rating != null ? clampRating(body.rating) : undefined;
    const type = body?.type != null ? sanitizeType(body.type) : undefined;
    const shopName = body?.shopName != null ? escapeHtml(body.shopName).slice(0, 50) : undefined;
    const drinkName = body?.drinkName != null ? escapeHtml(body.drinkName).slice(0, 50) : undefined;

    await db
      .prepare(
        `UPDATE feeds
         SET content   = COALESCE(?, content),
             rating    = COALESCE(?, rating),
             type      = COALESCE(?, type),
             shopName  = COALESCE(?, shopName),
             drinkName = COALESCE(?, drinkName)
         WHERE id = ?`
      )
      .bind(content || null, rating ?? null, type || null, shopName ?? null, drinkName ?? null, feedId)
      .run();

    return ok({});
  });
}
