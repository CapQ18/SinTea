// 聊天路由

import type { Router } from '../router';
import { ok, error } from '../response';
import { requireAuth } from '../middleware';

export function registerRoutes(router: Router): void {
  // GET /api/chats — 我的聊天列表（最近联系人）
  router.get('/api/chats', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;

    const conversations = await db
      .prepare(
        `SELECT c.*, 
           u.id as otherUserId, u.username, u.nickname, u.avatar
         FROM conversations c
         JOIN users u ON (CASE WHEN c.user1Id = ? THEN c.user2Id ELSE c.user1Id END) = u.id
         WHERE c.user1Id = ? OR c.user2Id = ?
         ORDER BY c.updatedAt DESC`,
      )
      .bind(auth.userId, auth.userId, auth.userId)
      .all();

    // 获取每个会话的未读数
    const enrichedConversations = await Promise.all(
      (conversations.results as any[]).map(async (conv: any) => {
        const unread = (await db
          .prepare(
            'SELECT COUNT(*) as count FROM messages WHERE conversationId = ? AND senderId != ? AND isRead = 0',
          )
          .bind(conv.id, auth.userId)
          .first()) as any;

        return {
          id: conv.id,
          otherUser: {
            id: conv.otherUserId,
            username: conv.username,
            nickname: conv.nickname,
            avatar: conv.avatar,
          },
          lastMessage: conv.lastMessageContent || '',
          lastMessageTime: conv.lastMessageTime || conv.updatedAt,
          unreadCount: unread?.count || 0,
        };
      }),
    );

    return ok({ chats: enrichedConversations });
  });

  // GET /api/chats/:userId — 与指定用户的聊天记录
  router.get('/api/chats/:userId', async (request, env, params) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const otherUserId = parseInt(params.userId);
    if (isNaN(otherUserId)) return error('无效的用户ID', 400);
    if (otherUserId === auth.userId) return error('不能和自己聊天', 400);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // 查找或创建会话
    let conversation = (await db
      .prepare(
        'SELECT id FROM conversations WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)',
      )
      .bind(auth.userId, otherUserId, otherUserId, auth.userId)
      .first()) as any;

    if (!conversation) {
      // 创建新会话
      const [user1Id, user2Id] =
        auth.userId < otherUserId
          ? [auth.userId, otherUserId]
          : [otherUserId, auth.userId];

      const result = await db
        .prepare(
          'INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)',
        )
        .bind(user1Id, user2Id)
        .run();

      conversation = { id: Number(result.lastInsertRowid) };
    }

    // 获取消息列表
    const messages = await db
      .prepare(
        'SELECT m.*, u.username, u.nickname, u.avatar FROM messages m JOIN users u ON m.senderId = u.id WHERE m.conversationId = ? ORDER BY m.createdAt DESC LIMIT ? OFFSET ?',
      )
      .bind(conversation.id, limit, offset)
      .all();

    // 标记对方的消息为已读
    await db
      .prepare(
        'UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderId = ? AND isRead = 0',
      )
      .bind(conversation.id, otherUserId)
      .run();

    // 获取总数
    const total = (await db
      .prepare('SELECT COUNT(*) as count FROM messages WHERE conversationId = ?')
      .bind(conversation.id)
      .first()) as any;

    return ok({
      messages: messages.results.reverse(), // 正序返回
      conversationId: conversation.id,
      total: total?.count || 0,
      page,
      limit,
      hasMore: offset + limit < (total?.count || 0),
    });
  });

  // POST /api/chats — 发送消息
  router.post('/api/chats', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json();
    const { toUserId, content } = body;

    if (!toUserId || !content || !content.trim()) {
      return error('请填写完整信息', 400);
    }

    const targetId = parseInt(toUserId);
    if (isNaN(targetId)) return error('无效的用户ID', 400);
    if (targetId === auth.userId) return error('不能给自己发消息', 400);

    // 查找或创建会话
    const [user1Id, user2Id] =
      auth.userId < targetId
        ? [auth.userId, targetId]
        : [targetId, auth.userId];

    let conversation = (await db
      .prepare(
        'SELECT id FROM conversations WHERE user1Id = ? AND user2Id = ?',
      )
      .bind(user1Id, user2Id)
      .first()) as any;

    if (!conversation) {
      const result = await db
        .prepare('INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)')
        .bind(user1Id, user2Id)
        .run();
      conversation = { id: Number(result.lastInsertRowid) };
    }

    // 插入消息
    const msgResult = await db
      .prepare(
        'INSERT INTO messages (conversationId, senderId, content) VALUES (?, ?, ?)',
      )
      .bind(conversation.id, auth.userId, content.trim())
      .run();

    // 更新会话最后消息
    const now = new Date().toISOString();
    await db
      .prepare(
        'UPDATE conversations SET lastMessageContent = ?, lastMessageSenderId = ?, lastMessageTime = ?, updatedAt = ? WHERE id = ?',
      )
      .bind(content.trim(), auth.userId, now, now, conversation.id)
      .run();

    return ok({
      messageId: Number(msgResult.lastInsertRowid),
      conversationId: conversation.id,
    });
  });

  // GET /api/chats/unread — 未读消息总数
  router.get('/api/chats/unread', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;

    const result = (await db
      .prepare(
        `SELECT COUNT(*) as count FROM messages m
         JOIN conversations c ON m.conversationId = c.id
         WHERE (c.user1Id = ? OR c.user2Id = ?)
           AND m.senderId != ?
           AND m.isRead = 0`,
      )
      .bind(auth.userId, auth.userId, auth.userId)
      .first()) as any;

    return ok({ unreadCount: result?.count || 0 });
  });
}
