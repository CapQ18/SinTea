// 用户路由（更新：XSS 净化 + 限流）

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';
import { sanitizeNickname, sanitizePlainText, escapeHtml } from '../security/sanitize';
import { rateLimit, RATE_LIMIT_PRESETS } from '../security/rateLimit';

// 头像的 data:image 长度上限（避免 base64 过大→存储到 D1）
const MAX_AVATAR_LENGTH = 200_000; // 约 200KB

function safeAvatar(username: string, raw?: string): string {
  if (
    raw &&
    raw.length <= MAX_AVATAR_LENGTH &&
    (raw.startsWith('https://') || raw.startsWith('http://') || raw.startsWith('data:image/'))
  ) {
    // data:image 的内容不需要转义；仅做一次长度和前缀白名单
    return raw;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

export function registerRoutes(router: Router): void {
  // GET /api/users — 用户列表
  router.get('/api/users', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const results = await db
      .prepare('SELECT id, username, nickname, avatar, bio, role FROM users LIMIT 50')
      .all();

    const users = (results.results as any[]).map((u) => ({
      ...u,
      nickname: u.nickname ? escapeHtml(u.nickname) : u.nickname,
      bio: u.bio ? sanitizePlainText(u.bio, 200) : u.bio,
      avatar: safeAvatar(u.username, u.avatar),
    }));

    return ok({ users });
  });

  // GET /api/users/:id — 用户详情
  router.get('/api/users/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return error('无效的用户ID', 400);

    const user = (await db
      .prepare('SELECT id, username, nickname, avatar, bio, role, createdAt FROM users WHERE id = ?')
      .bind(userId)
      .first()) as any;

    if (!user) return error('用户不存在', 404);

    const feedCount = (await db
      .prepare('SELECT COUNT(*) as count FROM feeds WHERE userId = ?')
      .bind(userId)
      .first()) as any;

    const likeCount = (await db
      .prepare('SELECT COUNT(*) as count FROM likes l JOIN feeds f ON l.feedId = f.id WHERE f.userId = ?')
      .bind(userId)
      .first()) as any;

    const tasteProfile = (await db
      .prepare(
        'SELECT AVG(sweetness) as sweetness, AVG(tea) as tea, AVG(milk) as milk, AVG(taste) as taste, AVG(coolness) as coolness, AVG(appearance) as appearance FROM feeds WHERE userId = ?'
      )
      .bind(userId)
      .first()) as any;

    return ok({
      user: {
        ...user,
        nickname: escapeHtml(user.nickname),
        bio: sanitizePlainText(user.bio, 200),
        avatar: safeAvatar(user.username, user.avatar),
        feedsCount: feedCount?.count || 0,
        likesCount: likeCount?.count || 0,
        tasteProfile: tasteProfile?.sweetness != null ? {
          sweetness: Math.round(tasteProfile.sweetness),
          tea: Math.round(tasteProfile.tea),
          milk: Math.round(tasteProfile.milk),
          taste: Math.round(tasteProfile.taste),
          coolness: Math.round(tasteProfile.coolness),
          appearance: Math.round(tasteProfile.appearance),
        } : null,
      },
    });
  });

  // PUT /api/users — 更新当前用户资料
  router.put('/api/users', async (request, env) => {
    const rl = await rateLimit(request, env, { limit: 20, windowMs: 60 * 60 * 1000, customKey: 'user:update' });
    if (rl.limited) return error(`请求过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const rawNickname: unknown = body?.nickname;
    const rawAvatar: unknown = body?.avatar;
    const rawBio: unknown = body?.bio;

    const cleanNickname = sanitizeNickname(rawNickname) || null;
    const cleanBio = rawBio != null ? sanitizePlainText(rawBio, 200) : null;
    const cleanAvatar = rawAvatar != null ? (safeAvatar(auth.username, String(rawAvatar)) || null) : null;

    const result = await db
      .prepare(
        'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE id = ?'
      )
      .bind(cleanNickname, cleanAvatar, cleanBio, auth.userId)
      .run();

    if (result.changes === 0) return error('更新失败', 500);

    const updatedUser = (await db
      .prepare('SELECT id, username, email, nickname, avatar, bio, role FROM users WHERE id = ?')
      .bind(auth.userId)
      .first()) as any;

    return ok({
      user: {
        ...updatedUser,
        nickname: escapeHtml(updatedUser.nickname),
        bio: sanitizePlainText(updatedUser.bio, 200),
        avatar: safeAvatar(updatedUser.username, updatedUser.avatar),
      },
    });
  });

  // GET /api/users/:id/feeds — 用户的动态列表（分页）
  router.get('/api/users/:id/feeds', async (request, env, params) => {
    const db = env.DB;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return error('无效的用户ID', 400);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20);
    const offset = (page - 1) * limit;

    const results = await db
      .prepare(
        'SELECT f.*, u.username, u.nickname FROM feeds f JOIN users u ON f.userId = u.id WHERE f.userId = ? ORDER BY f.createdAt DESC LIMIT ? OFFSET ?'
      )
      .bind(userId, limit, offset)
      .all();

    const total = (await db.prepare('SELECT COUNT(*) as count FROM feeds WHERE userId = ?').bind(userId).first()) as any;

    const feeds = (results.results as any[]).map((f: any) => {
      let images: any[] = [];
      try { images = f.images ? JSON.parse(f.images) : []; } catch { /* ignore */ }
      return {
        ...f,
        nickname: escapeHtml(f.nickname),
        content: sanitizePlainText(f.content, 5000),
        shopName: f.shopName ? escapeHtml(f.shopName) : f.shopName,
        drinkName: f.drinkName ? escapeHtml(f.drinkName) : f.drinkName,
        type: f.type ? escapeHtml(f.type) : f.type,
        avatar: safeAvatar(f.username),
        images,
      };
    });

    return ok({
      feeds,
      total: total?.count || 0,
      page,
      limit,
      hasMore: offset + limit < (total?.count || 0),
    });
  });

  // ===== 用户拉黑/屏蔽 =====

  // POST /api/users/:id/block — 拉黑用户
  router.post('/api/users/:id/block', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const targetId = parseInt(params.id);
    if (targetId === auth.userId) return error('不能拉黑自己', 400);

    await db.prepare(
      `CREATE TABLE IF NOT EXISTS user_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        blockedUserId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, blockedUserId)
      )`
    ).run();

    await db.prepare(
      'INSERT OR IGNORE INTO user_blocks (userId, blockedUserId) VALUES (?, ?)'
    ).bind(auth.userId, targetId).run();

    // 自动取消关注
    await db.prepare('DELETE FROM follows WHERE userId = ? AND targetUserId = ?')
      .bind(auth.userId, targetId).run();

    return ok({ message: '已拉黑' });
  });

  // DELETE /api/users/:id/block — 取消拉黑
  router.delete('/api/users/:id/block', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const targetId = parseInt(params.id);

    await db.prepare('DELETE FROM user_blocks WHERE userId = ? AND blockedUserId = ?')
      .bind(auth.userId, targetId).run();

    return ok({ message: '已取消拉黑' });
  });

  // GET /api/users/blocks — 我的拉黑列表
  router.get('/api/users/blocks', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const result = await db.prepare(
      `SELECT u.id, u.username, u.nickname, u.avatar
       FROM user_blocks b
       JOIN users u ON b.blockedUserId = u.id
       WHERE b.userId = ?
       ORDER BY b.createdAt DESC`
    ).bind(auth.userId).all();

    return ok({ blocks: (result.results as any[]) || [] });
  });

  // GET /api/users/blocked-ids — 我拉黑的用户 ID 列表（前端用于过滤）
  router.get('/api/users/blocked-ids', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const result = await db.prepare(
      'SELECT blockedUserId FROM user_blocks WHERE userId = ?'
    ).bind(auth.userId).all();

    const ids = (result.results as any[]).map(r => r.blockedUserId);
    return ok({ blockedIds: ids });
  });
}
