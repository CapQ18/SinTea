// 心愿单路由

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';
import { createNotification } from './notifications';

export function registerRoutes(router: Router): void {
  // GET /api/wishlists — 我的心愿单列表
  router.get('/api/wishlists', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const results = await db
      .prepare(
        'SELECT id, drinkName, shopName, category, imageUrl, isDrank, addedAt FROM wishlists WHERE userId = ? ORDER BY addedAt DESC',
      )
      .bind(auth.userId)
      .all();

    return ok({ wishlists: results.results });
  });

  // POST /api/wishlists — 添加心愿单
  router.post('/api/wishlists', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { drinkName, shopName, category, imageUrl } = body;

    if (!drinkName) {
      return error('饮品名称不能为空', 400);
    }

    const result = await db
      .prepare(
        'INSERT INTO wishlists (userId, drinkName, shopName, category, imageUrl, isDrank) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(auth.userId, drinkName, shopName || '', category || '奶茶', imageUrl || '', 0)
      .run();

    return ok({ wishlistId: Number(result.lastInsertRowid) });
  });

  // PUT /api/wishlists/:id — 标记已喝/未喝
  router.put('/api/wishlists/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const wishlistId = parseInt(params.id);
    if (isNaN(wishlistId)) return error('无效的心愿单ID', 400);

    const body: any = await request.json();
    const { isDrank } = body;

    const result = await db
      .prepare('UPDATE wishlists SET isDrank = ? WHERE id = ? AND userId = ?')
      .bind(isDrank ? 1 : 0, wishlistId, auth.userId)
      .run();

    if (result.changes === 0) {
      return error('更新失败，心愿单不存在或不属于你', 400);
    }

    return ok({});
  });

  // DELETE /api/wishlists/:id — 删除心愿单
  router.delete('/api/wishlists/:id', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const wishlistId = parseInt(params.id);
    if (isNaN(wishlistId)) return error('无效的心愿单ID', 400);

    const result = await db
      .prepare('DELETE FROM wishlists WHERE id = ? AND userId = ?')
      .bind(wishlistId, auth.userId)
      .run();

    if (result.changes === 0) {
      return error('删除失败，心愿单不存在或不属于你', 400);
    }

    return ok({});
  });

  // GET /api/wishlists/user/:userId — 查看他人心愿单（仅未喝）
  router.get('/api/wishlists/user/:userId', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const targetUserId = parseInt(params.userId);
    if (isNaN(targetUserId)) return error('无效的用户ID', 400);

    const results = await db
      .prepare(
        'SELECT id, drinkName, shopName, category, imageUrl, isDrank, addedAt FROM wishlists WHERE userId = ? AND isDrank = 0 ORDER BY addedAt DESC',
      )
      .bind(targetUserId)
      .all();

    return ok({ wishlists: results.results });
  });

  // POST /api/wishlists/:id/treat — 请她喝
  router.post('/api/wishlists/:id/treat', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const wishlistId = parseInt(params.id);
    if (isNaN(wishlistId)) return error('无效的心愿单ID', 400);

    // 获取心愿单信息
    const wishlist = (await db
      .prepare('SELECT * FROM wishlists WHERE id = ?')
      .bind(wishlistId)
      .first()) as any;

    if (!wishlist) return error('心愿单不存在', 404);
    if (wishlist.isDrank) return error('这杯已经喝过了', 400);

    const ownerId = wishlist.userId;
    if (ownerId === auth.userId) return error('不能请自己喝哦', 400);

    // 检查是否已关注对方
    const isFollowing = await db
      .prepare('SELECT id FROM follows WHERE userId = ? AND targetUserId = ?')
      .bind(auth.userId, ownerId)
      .first();

    if (!isFollowing) return error('先关注对方才能请她喝哦', 400);

    // 检查是否已请过这杯
    const alreadyTreated = await db
      .prepare('SELECT id FROM notifications WHERE userId = ? AND fromUserId = ? AND type = ? AND feedId IS NULL')
      .bind(ownerId, auth.userId, 'treat')
      .first();

    // 检查是否是同一个 wishlist（通过 notification 的 commentContent 中包含 drinkName 来判断）
    // 简化：不允许重复请同一杯
    if (alreadyTreated) {
      return error('你已经请过她了，快去聊天吧', 400);
    }

    // 创建通知
    await createNotification(db, 'treat', ownerId, auth.userId, {
      commentContent: wishlist.drinkName,
    });

    // 发送聊天消息
    const [user1Id, user2Id] =
      auth.userId < ownerId ? [auth.userId, ownerId] : [ownerId, auth.userId];

    let conversation = (await db
      .prepare('SELECT id FROM conversations WHERE user1Id = ? AND user2Id = ?')
      .bind(user1Id, user2Id)
      .first()) as any;

    if (!conversation) {
      const result = await db
        .prepare('INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)')
        .bind(user1Id, user2Id)
        .run();
      conversation = { id: Number(result.lastInsertRowid) };
    }

    const msg = `我请你喝 ${wishlist.drinkName}！🧋`;
    const now = new Date().toISOString();
    await db
      .prepare('INSERT INTO messages (conversationId, senderId, content) VALUES (?, ?, ?)')
      .bind(conversation.id, auth.userId, msg)
      .run();
    await db
      .prepare(
        'UPDATE conversations SET lastMessageContent = ?, lastMessageSenderId = ?, lastMessageTime = ?, updatedAt = ? WHERE id = ?',
      )
      .bind(msg, auth.userId, now, now, conversation.id)
      .run();

    return ok({ message: '已发送请求！快去找她聊天吧', conversationId: conversation.id });
  });
}
