import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAdmin } from '../middleware';

function logAction(db: D1Database, adminId: number, action: string, targetType?: string, targetId?: number, detail?: string) {
  return db
    .prepare('INSERT INTO admin_logs (adminId, action, targetType, targetId, detail) VALUES (?, ?, ?, ?, ?)')
    .bind(adminId, action, targetType || null, targetId || null, detail || null)
    .run();
}

export function registerRoutes(router: Router): void {
  // GET /api/admin/stats — 后台统计数据
  router.get('/api/admin/stats', async (request, env) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;

    const [userCount, feedCount, likeCount, commentCount, todayUsers] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users').first(),
      db.prepare('SELECT COUNT(*) as count FROM feeds').first(),
      db.prepare('SELECT COUNT(*) as count FROM likes').first(),
      db.prepare('SELECT COUNT(*) as count FROM comments').first(),
      db.prepare("SELECT COUNT(*) as count FROM users WHERE DATE(createdAt) = DATE('now')").first(),
    ]);

    const recentUsers = await db
      .prepare('SELECT id, username, nickname, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 10')
      .all();

    const recentFeeds = await db
      .prepare('SELECT f.id, f.content, f.shopName, f.drinkName, f.likes, f.featured, f.createdAt, u.username, u.nickname FROM feeds f JOIN users u ON f.userId = u.id ORDER BY f.createdAt DESC LIMIT 10')
      .all();

    const topShops = await db
      .prepare('SELECT shopName, COUNT(*) as count FROM feeds WHERE shopName IS NOT NULL AND shopName != "" GROUP BY shopName ORDER BY count DESC LIMIT 10')
      .all();

    return ok({
      stats: {
        totalUsers: (userCount as any)?.count || 0,
        totalFeeds: (feedCount as any)?.count || 0,
        totalLikes: (likeCount as any)?.count || 0,
        totalComments: (commentCount as any)?.count || 0,
        todayNewUsers: (todayUsers as any)?.count || 0,
      },
      recentUsers: (recentUsers.results as any[]) || [],
      recentFeeds: (recentFeeds.results as any[]) || [],
      topShops: (topShops.results as any[]) || [],
    });
  });

  // GET /api/admin/users — 用户管理列表
  router.get('/api/admin/users', async (request, env) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';

    let whereClause = '';
    const binds: any[] = [];
    if (search) {
      whereClause = 'WHERE username LIKE ? OR nickname LIKE ? OR email LIKE ?';
      const pattern = `%${search}%`;
      binds.push(pattern, pattern, pattern);
    }

    const users = await db
      .prepare(`SELECT id, username, email, nickname, avatar, bio, role, createdAt FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset)
      .all();

    const total = await db
      .prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`)
      .bind(...binds)
      .first();

    return ok({
      users: (users.results as any[]) || [],
      total: (total as any)?.count || 0,
      page,
      hasMore: offset + limit < ((total as any)?.count || 0),
    });
  });

  // PUT /api/admin/users/:id — 修改用户（设置管理员/封禁）
  router.put('/api/admin/users/:id', async (request, env, params) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const userId = parseInt(params.id);
    const body: any = await request.json();
    const { role, nickname, bio } = body;

    if (role && !['user', 'admin', 'banned'].includes(role)) {
      return error('无效的角色', 400);
    }

    const fields: string[] = [];
    const binds: any[] = [];

    if (role) { fields.push('role = ?'); binds.push(role); }
    if (nickname != null) { fields.push('nickname = ?'); binds.push(nickname); }
    if (bio != null) { fields.push('bio = ?'); binds.push(bio); }

    if (fields.length === 0) {
      return error('没有需要更新的字段', 400);
    }

    binds.push(userId);
    const result = await db
      .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...binds)
      .run();

    if (result.changes === 0) {
      return error('用户不存在', 404);
    }

    await logAction(db, admin.userId, 'update_user', 'user', userId, `设置角色为 ${role}`);

    return ok({ message: '更新成功' });
  });

  // DELETE /api/admin/users/:id — 删除用户
  router.delete('/api/admin/users/:id', async (request, env, params) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const userId = parseInt(params.id);

    if (userId === admin.userId) {
      return error('不能删除自己', 400);
    }

    await db.prepare('DELETE FROM feeds WHERE userId = ?').bind(userId).run();
    await db.prepare('DELETE FROM likes WHERE userId = ?').bind(userId).run();
    await db.prepare('DELETE FROM comments WHERE userId = ?').bind(userId).run();
    await db.prepare('DELETE FROM follows WHERE userId = ? OR targetUserId = ?').bind(userId, userId).run();
    await db.prepare('DELETE FROM wishlists WHERE userId = ?').bind(userId).run();
    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    await logAction(db, admin.userId, 'delete_user', 'user', userId);

    return ok({ message: '删除成功' });
  });

  // GET /api/admin/feeds — 动态管理列表
  router.get('/api/admin/feeds', async (request, env) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const filter = url.searchParams.get('filter') || 'all';

    let whereClause = '';
    if (filter === 'featured') whereClause = 'WHERE f.featured = 1';
    if (filter === 'normal') whereClause = 'WHERE f.featured = 0';

    const feeds = await db
      .prepare(`SELECT f.*, u.username, u.nickname FROM feeds f JOIN users u ON f.userId = u.id ${whereClause} ORDER BY f.createdAt DESC LIMIT ? OFFSET ?`)
      .bind(limit, offset)
      .all();

    const total = await db
      .prepare(`SELECT COUNT(*) as count FROM feeds f ${whereClause}`)
      .first();

    return ok({
      feeds: (feeds.results as any[]) || [],
      total: (total as any)?.count || 0,
      page,
      hasMore: offset + limit < ((total as any)?.count || 0),
    });
  });

  // PUT /api/admin/feeds/:id — 设精华/取消精华
  router.put('/api/admin/feeds/:id', async (request, env, params) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const feedId = parseInt(params.id);
    const body: any = await request.json();
    const { featured } = body;

    if (featured == null) {
      return error('请指定 featured 字段', 400);
    }

    await db
      .prepare('UPDATE feeds SET featured = ? WHERE id = ?')
      .bind(featured ? 1 : 0, feedId)
      .run();

    await logAction(db, admin.userId, featured ? 'set_featured' : 'cancel_featured', 'feed', feedId);

    return ok({ message: featured ? '已设为精华' : '已取消精华' });
  });

  // DELETE /api/admin/feeds/:id — 删除动态
  router.delete('/api/admin/feeds/:id', async (request, env, params) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const feedId = parseInt(params.id);

    await db.prepare('DELETE FROM comments WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM likes WHERE feedId = ?').bind(feedId).run();
    await db.prepare('DELETE FROM feeds WHERE id = ?').bind(feedId).run();

    await logAction(db, admin.userId, 'delete_feed', 'feed', feedId);

    return ok({ message: '删除成功' });
  });

  // GET /api/admin/logs — 管理员操作日志
  router.get('/api/admin/logs', async (request, env) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const logs = await db
      .prepare('SELECT l.*, u.username as adminName FROM admin_logs l JOIN users u ON l.adminId = u.id ORDER BY l.createdAt DESC LIMIT ?')
      .bind(limit)
      .all();

    return ok({ logs: (logs.results as any[]) || [] });
  });
}
