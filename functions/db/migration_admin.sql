-- 给 users 表添加 role 字段
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- 创建管理员：把 id=1 的用户设为管理员（你需要告诉我要把哪个账号设为管理员）
-- UPDATE users SET role = 'admin' WHERE username = '你的管理员用户名';

-- feeds 表增加 featured 字段（精华标记）
ALTER TABLE feeds ADD COLUMN featured INTEGER DEFAULT 0;

-- 创建管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adminId INTEGER NOT NULL,
  action TEXT NOT NULL,
  targetType TEXT,
  targetId INTEGER,
  detail TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(id)
);
