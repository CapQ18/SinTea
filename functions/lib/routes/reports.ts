// 举报路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth, requireAdmin } from '../middleware';
import { sanitizePlainText } from '../security/sanitize';
import { rateLimit } from '../security/rateLimit';

const REPORT_REASONS = [
  '垃圾广告', '色情低俗', '违法违规', '不实信息',
  '人身攻击', '抄袭侵权', '其他',
] as const;

export async function ensureReportsTable(db: D1Database): Promise<void> {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporterId INTEGER NOT NULL,
      targetType TEXT NOT NULL,
      targetId INTEGER NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT,
      status TEXT DEFAULT 'pending',
      handledBy INTEGER,
      handleNote TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      handledAt TEXT
    )`
  ).run();
}

export function registerRoutes(router: Router): void {
  // POST /api/reports — 用户提交举报
  router.post('/api/reports', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const rl = await rateLimit(request, env, { limit: 10, windowMs: 60 * 60 * 1000, customKey: 'report' });
    if (rl.limited) return error(`举报过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const db = env.DB;
    const body: any = await request.json().catch(() => ({}));
    const { targetType, targetId, reason, detail } = body;

    if (!['feed', 'comment', 'user'].includes(targetType)) {
      return error('无效的举报类型', 400);
    }
    if (!targetId) return error('缺少举报目标 ID', 400);
    if (!REPORT_REASONS.includes(reason)) return error('请选择举报原因', 400);

    const safeDetail = sanitizePlainText(detail, 500);

    await ensureReportsTable(db);
    await db.prepare(
      'INSERT INTO reports (reporterId, targetType, targetId, reason, detail) VALUES (?, ?, ?, ?, ?)'
    ).bind(auth.userId, targetType, Number(targetId), reason, safeDetail).run();

    return ok({ message: '举报已提交，我们会尽快处理' });
  });

  // GET /api/admin/reports — 管理员查看举报列表
  router.get('/api/admin/reports', async (request, env) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    await ensureReportsTable(db);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    const whereClause = status === 'all' ? '' : 'WHERE r.status = ?';
    const binds = status === 'all' ? [] : [status];

    const reports = await db.prepare(
      `SELECT r.*, u.username as reporterName, u.nickname as reporterNick
       FROM reports r
       JOIN users u ON r.reporterId = u.id
       ${whereClause}
       ORDER BY r.createdAt DESC LIMIT ? OFFSET ?`
    ).bind(...binds, limit, offset).all();

    const total = await db.prepare(
      `SELECT COUNT(*) as count FROM reports r ${whereClause}`
    ).bind(...binds).first();

    return ok({
      reports: (reports.results as any[]) || [],
      total: (total as any)?.count || 0,
      page,
      hasMore: offset + limit < ((total as any)?.count || 0),
    });
  });

  // POST /api/admin/reports/:id/action — 管理员处理举报
  router.post('/api/admin/reports/:id/action', async (request, env, params) => {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;

    const db = env.DB;
    await ensureReportsTable(db);

    const reportId = parseInt(params.id);
    const body: any = await request.json().catch(() => ({}));
    const { action, note } = body;

    if (!['approve', 'reject', 'delete_content', 'ban_user'].includes(action)) {
      return error('无效的处理操作', 400);
    }

    const report = (await db.prepare('SELECT * FROM reports WHERE id = ?').bind(reportId).first()) as any;
    if (!report) return error('举报记录不存在', 404);

    const statusMap: Record<string, string> = {
      approve: 'resolved',
      reject: 'rejected',
      delete_content: 'resolved',
      ban_user: 'resolved',
    };

    await db.prepare(
      'UPDATE reports SET status = ?, handledBy = ?, handleNote = ?, handledAt = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(statusMap[action], admin.userId, sanitizePlainText(note, 500) || null, reportId).run();

    // 执行处理动作
    if (action === 'delete_content') {
      if (report.targetType === 'feed') {
        await db.prepare('DELETE FROM comments WHERE feedId = ?').bind(report.targetId).run();
        await db.prepare('DELETE FROM likes WHERE feedId = ?').bind(report.targetId).run();
        await db.prepare('DELETE FROM feeds WHERE id = ?').bind(report.targetId).run();
      } else if (report.targetType === 'comment') {
        await db.prepare('DELETE FROM comments WHERE id = ?').bind(report.targetId).run();
      }
    }

    if (action === 'ban_user') {
      const targetUserId = report.targetType === 'user'
        ? report.targetId
        : ((await db.prepare('SELECT userId FROM feeds WHERE id = ?').bind(report.targetId).first()) as any)?.userId
          || ((await db.prepare('SELECT userId FROM comments WHERE id = ?').bind(report.targetId).first()) as any)?.userId;
      if (targetUserId) {
        await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind('banned', targetUserId).run();
      }
    }

    return ok({ message: '举报已处理' });
  });
}
