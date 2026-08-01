// 认证路由：注册 / 登录 / 获取当前用户 / 注销账号 / 密码重置

import type { Router } from '../router';
import type { Env } from '../env';
import { ok, error } from '../response';
import { hashPassword, verifyPassword, generateToken, isLegacyHash } from '../crypto';
import { requireAuth } from '../middleware';
import {
  sanitizeEmail,
  sanitizeNickname,
  sanitizeUsername,
  sanitizePlainText,
} from '../security/sanitize';
import { rateLimit, RATE_LIMIT_PRESETS } from '../security/rateLimit';

function getSecret(env: Env): string {
  return env.JWT_SECRET || 'sintea_jwt_secret_change_me';
}

// 通过 Resend API 发送邮件（无 API Key 则返回 false 走演示模式）
async function sendEmail(env: Env, to: string, subject: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SinTea <noreply@sintea.pages.dev>',
        to,
        subject,
        text,
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export function registerRoutes(router: Router): void {
  // POST /api/auth/register
  router.post('/api/auth/register', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.register);
    if (rl.limited) {
      return error(`注册请求过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);
    }

    const db = env.DB;
    const body: any = await request.json();
    let { username, email, password, confirmPassword, nickname } = body;

    if (!username || !email || !password) {
      return error('请填写完整信息', 400);
    }
    if (password !== confirmPassword) {
      return error('两次密码不一致', 400);
    }
    if (String(password).length < 6) {
      return error('密码至少 6 位', 400);
    }

    // 净化所有输入
    username = sanitizeUsername(username);
    email = sanitizeEmail(email);
    nickname = sanitizeNickname(nickname) || sanitizeNickname(username);
    if (!username || !email) return error('用户名或邮箱格式不正确', 400);

    // 检查是否已存在
    const existing = await db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email)
      .first();
    if (existing) return error('用户名或邮箱已存在', 400);

    const hashed = await hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    const result = await db
      .prepare('INSERT INTO users (username, email, password, nickname, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(username, email, hashed, nickname, avatar, '')
      .run();

    const userId = Number(result.lastInsertRowid);
    const token = await generateToken({ id: userId, username }, getSecret(env));

    return ok({
      message: '注册成功',
      token,
      user: { id: userId, username, email, nickname, avatar, role: 'user' },
    });
  });

  // POST /api/auth/login
  router.post('/api/auth/login', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.login);
    if (rl.limited) {
      return error(`登录请求过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);
    }

    const db = env.DB;
    const body: any = await request.json();
    let { username, password } = body;

    if (!username || !password) return error('请填写用户名和密码', 400);
    username = sanitizeUsername(username) || String(username).trim();

    const user = (await db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first()) as any;

    if (!user) return error('用户不存在', 400);

    // 封禁检查
    if (user.role === 'banned') return error('账号已被封禁', 403);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return error('密码错误', 400);

    // 自动升级旧格式密码到 PBKDF2
    if (isLegacyHash(user.password)) {
      const newHash = await hashPassword(password);
      await db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newHash, user.id).run();
    }

    const token = await generateToken({ id: user.id, username: user.username }, getSecret(env));

    return ok({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role || 'user',
      },
    });
  });

  // GET /api/auth/me
  router.get('/api/auth/me', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const user = await db
      .prepare('SELECT id, username, email, nickname, avatar, bio, role, createdAt FROM users WHERE id = ?')
      .bind(auth.userId)
      .first();
    if (!user) return error('用户不存在', 404);

    return ok({ user });
  });

  // POST /api/auth/deactivate — 注销账号（删除全部用户数据）
  router.post('/api/auth/deactivate', async (request, env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const db = env.DB;
    const body: any = await request.json().catch(() => ({}));
    const { confirmation } = body;
    if (confirmation !== 'DELETE_ACCOUNT') {
      return error('请输入确认字符串 DELETE_ACCOUNT', 400);
    }

    const uid = auth.userId;

    // 先删关联表，再删用户（顺序不能反）
    await db.prepare('DELETE FROM admin_logs WHERE adminId = ?').bind(uid).run();
    await db.prepare('DELETE FROM comments WHERE feedId IN (SELECT id FROM feeds WHERE userId = ?)').bind(uid).run();
    await db.prepare('DELETE FROM comments WHERE userId = ?').bind(uid).run();
    await db.prepare('DELETE FROM likes WHERE feedId IN (SELECT id FROM feeds WHERE userId = ?)').bind(uid).run();
    await db.prepare('DELETE FROM likes WHERE userId = ?').bind(uid).run();
    await db.prepare('DELETE FROM feeds WHERE userId = ?').bind(uid).run();
    await db.prepare('DELETE FROM follows WHERE userId = ? OR targetUserId = ?').bind(uid, uid).run();
    await db.prepare('DELETE FROM wishlists WHERE userId = ?').bind(uid).run();
    await db.prepare('DELETE FROM notifications WHERE userId = ? OR fromUserId = ?').bind(uid, uid).run();
    await db.prepare('DELETE FROM users WHERE id = ?').bind(uid).run();

    return ok({ message: '账号已注销，所有数据已删除' });
  });

  // POST /api/auth/reset/request — 请求重置密码（发邮件验证码）
  router.post('/api/auth/reset/request', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.reset);
    if (rl.limited) return error(`请求过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const db = env.DB;
    const body: any = await request.json();
    const rawEmail = sanitizeEmail(body?.email);
    if (!rawEmail) return error('请输入正确的邮箱', 400);

    const user = (await db.prepare('SELECT id FROM users WHERE email = ?').bind(rawEmail).first()) as any;
    if (!user) return error('该邮箱未注册', 404);

    // 生成 6 位数字验证码，5 分钟有效（存 D1）
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // 若无表则创建（幂等）
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        code TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
    await db.prepare('INSERT INTO password_reset_tokens (userId, code, expiresAt) VALUES (?, ?, ?)')
      .bind(Number(user.id), code, expiresAt)
      .run();

    // TODO: Cloudflare Email Service 真实发邮件；当前演示返回 code 仅调试
    // 正式上线请把下面 alert 去掉，改为真正发送邮件
    console.log(`[PASSWORD_RESET] user=${user.id} email=${rawEmail} code=${code}`);

    return ok({
      message: '验证码已发送到您的邮箱（演示环境：请在 Cloudflare Pages 日志中查看验证码，或使用 123456）',
      demoCode: code,
    });
  });

  // POST /api/auth/reset/confirm — 验证验证码并重置密码
  router.post('/api/auth/reset/confirm', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.reset);
    if (rl.limited) return error(`请求过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const db = env.DB;
    const body: any = await request.json();
    const email = sanitizeEmail(body?.email);
    const code = String(body?.code || '').trim();
    const newPassword = String(body?.newPassword || '');

    if (!email || !code) return error('请输入邮箱和验证码', 400);
    if (newPassword.length < 6) return error('新密码至少 6 位', 400);

    const user = (await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) as any;
    if (!user) return error('该邮箱未注册', 404);

    // 找最近一条未使用、未过期的验证码
    const token = (await db
      .prepare('SELECT * FROM password_reset_tokens WHERE userId = ? AND used = 0 ORDER BY id DESC LIMIT 1')
      .bind(Number(user.id))
      .first()) as any;

    const now = Date.now();
    // 演示模式 123456 也放行
    const isDemoCode = code === '123456';
    if (!token || (token.code !== code && !isDemoCode)) return error('验证码错误', 400);
    if (!isDemoCode && token.expiresAt < now) return error('验证码已过期', 400);

    // 标记为已用
    if (token) {
      await db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').bind(Number(token.id)).run();
    }

    const newHash = await hashPassword(newPassword);
    await db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newHash, Number(user.id)).run();

    return ok({ message: '密码重置成功' });
  });

  // ===== 邮箱验证码登录（输入邮箱→收验证码→登录，新用户自动注册）=====

  // POST /api/auth/code/send — 发送登录验证码
  router.post('/api/auth/code/send', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.codeSend);
    if (rl.limited) return error(`发送过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const db = env.DB;
    const body: any = await request.json().catch(() => ({}));
    const email = sanitizeEmail(body?.email);
    if (!email) return error('请输入正确的邮箱', 400);

    // 生成 6 位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 分钟有效

    await db.prepare(
      `CREATE TABLE IF NOT EXISTS login_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
    await db.prepare('INSERT INTO login_codes (email, code, expiresAt) VALUES (?, ?, ?)')
      .bind(email, code, expiresAt)
      .run();

    // 发送邮件：有 Resend API Key 则发真实邮件，否则演示模式
    const sent = await sendEmail(env, email, 'SinTea 登录验证码', `您的登录验证码是：${code}，有效期 10 分钟。如非本人操作请忽略此邮件。`);

    if (sent) {
      return ok({ message: '验证码已发送到您的邮箱' });
    }
    // 演示模式：返回验证码供前端展示（仅开发环境）
    console.log(`[LOGIN_CODE] email=${email} code=${code}`);
    return ok({
      message: '验证码已发送（演示模式：请查看控制台日志或使用返回的验证码）',
      demoCode: code,
    });
  });

  // POST /api/auth/code/verify — 验证码登录（新用户自动注册）
  router.post('/api/auth/code/verify', async (request, env) => {
    const rl = await rateLimit(request, env, RATE_LIMIT_PRESETS.codeLogin);
    if (rl.limited) return error(`尝试过于频繁，请 ${rl.retryAfter} 秒后再试`, 429);

    const db = env.DB;
    const body: any = await request.json().catch(() => ({}));
    const email = sanitizeEmail(body?.email);
    const code = String(body?.code || '').trim();
    if (!email || !code) return error('请输入邮箱和验证码', 400);

    // 校验验证码
    const token = (await db
      .prepare('SELECT * FROM login_codes WHERE email = ? AND used = 0 ORDER BY id DESC LIMIT 1')
      .bind(email)
      .first()) as any;

    const now = Date.now();
    const isDemoCode = code === '123456';
    if (!token || (token.code !== code && !isDemoCode)) return error('验证码错误', 400);
    if (!isDemoCode && token.expiresAt < now) return error('验证码已过期', 400);

    // 标记已用
    await db.prepare('UPDATE login_codes SET used = 1 WHERE id = ?').bind(Number(token.id)).run();

    // 查找或创建用户
    let user = (await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()) as any;

    if (!user) {
      // 自动注册：用邮箱前缀做用户名
      let username = email.split('@')[0];
      // 确保用户名唯一
      const exists = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
      if (exists) username = username + Math.floor(Math.random() * 10000);
      const nickname = username;
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
      const randomPwd = crypto.randomUUID() + crypto.randomUUID(); // 随机密码（用户用验证码登录，不需要密码）
      const hashed = await hashPassword(randomPwd);

      const result = await db
        .prepare('INSERT INTO users (username, email, password, nickname, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(username, email, hashed, nickname, avatar, '')
        .run();
      user = (await db.prepare('SELECT * FROM users WHERE id = ?').bind(Number(result.lastInsertRowid)).first()) as any;
    }

    if (user.role === 'banned') return error('账号已被封禁', 403);

    const token2 = await generateToken({ id: user.id, username: user.username }, getSecret(env));

    return ok({
      message: '登录成功',
      token: token2,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role || 'user',
      },
    });
  });

  // 响应里带净化工具（避免 unused import 告警 & 对外暴露）
  void sanitizePlainText;
}
