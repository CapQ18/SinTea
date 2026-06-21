// 通知路由

import type { Router } from '../router';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

export function registerRoutes(router: Router): void {
  // GET /api/notifications — 我的通知列表（分页）
  router.get('/api/notifications', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    const results = await db
      .prepare(
        `SELECT n.*, 
           u.username as fromUsername, u.nickname as fromNickname, u.avatar as fromAvatar
         FROM notifications n
         JOIN users u ON n.fromUserId = u.id
         WHERE n.userId = ?
         ORDER BY n.createdAt DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(auth.userId, limit, offset)
      .all();

    const total = (await db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ?')
      .bind(auth.userId)
      .first()) as any;

    return ok({
      notifications: results.results,
      total: total?.count || 0,
      page,
      limit,
      hasMore: offset + limit < (total?.count || 0),
    });
  });

  // GET /api/notifications/unread-count — 未读通知数
  router.get('/api/notifications/unread-count', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;

    const result = (await db
      .prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0',
      )
      .bind(auth.userId)
      .first()) as any;

    return ok({ unreadCount: result?.count || 0 });
  });

  // PUT /api/notifications/read-all — 全部标记已读
  router.put('/api/notifications/read-all', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;

    await db
      .prepare('UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0')
      .bind(auth.userId)
      .run();

    return ok({});
  });
}

// 辅助函数：创建通知（供其他路由模块调用）
export async function createNotification(
  db: D1Database,
  type: 'like' | 'comment' | 'follow' | 'treat',
  userId: number,       // 接收者
  fromUserId: number,   // 触发者
  extra?: { feedId?: number; commentContent?: string },
): Promise<void> {
  // 不给自己发通知
  if (userId === fromUserId) return;

  try {
    await db
      .prepare(
        'INSERT INTO notifications (userId, type, fromUserId, feedId, commentContent) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(
        userId,
        type,
        fromUserId,
        extra?.feedId || null,
        extra?.commentContent || null,
      )
      .run();
  } catch {
    // 通知创建失败不影响主流程
  }
}
