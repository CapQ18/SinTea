-- Phase 2 数据表迁移：聊天系统 + 通知系统
-- 在 Cloudflare D1 控制台或通过 wrangler CLI 执行

-- 会话表（两个用户之间的对话）
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1Id INTEGER NOT NULL,
  user2Id INTEGER NOT NULL,
  lastMessageContent TEXT,
  lastMessageSenderId INTEGER,
  lastMessageTime TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  UNIQUE(user1Id, user2Id),
  FOREIGN KEY (user1Id) REFERENCES users(id),
  FOREIGN KEY (user2Id) REFERENCES users(id)
);

-- 确保 user1Id < user2Id 的约束可以通过应用层保证

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversationId INTEGER NOT NULL,
  senderId INTEGER NOT NULL,
  content TEXT NOT NULL,
  imageUrl TEXT,
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (conversationId) REFERENCES conversations(id),
  FOREIGN KEY (senderId) REFERENCES users(id)
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,          -- 接收通知的用户
  type TEXT NOT NULL,               -- 'like' | 'comment' | 'follow'
  fromUserId INTEGER NOT NULL,      -- 触发通知的用户
  feedId INTEGER,                   -- 关联的动态（点赞/评论时）
  commentContent TEXT,              -- 评论内容（评论通知时）
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (fromUserId) REFERENCES users(id),
  FOREIGN KEY (feedId) REFERENCES feeds(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId, createdAt);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(senderId);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(userId, isRead);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1Id, updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2Id, updatedAt DESC);
