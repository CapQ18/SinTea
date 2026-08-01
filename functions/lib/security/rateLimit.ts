// 简单的内存内存 + 持久化混合限流（D1 存储 24h 窗口计数）
import type { Env } from '../env';

// 内存 LRU（快速路径），避免每次写数据库
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const MAX_MEMORY_KEYS = 10_000;

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfter: number; // 秒
}

function getClientIp(request: Request, env: Env): string {
  const xff = request.headers.get('CF-Connecting-IP'); // Cloudflare 真实 IP
  if (xff) return xff;
  const xff2 = request.headers.get('X-Forwarded-For');
  return xff2 ? xff2.split(',')[0].trim() : 'anonymous';
}

function keyFor(request: Request, env: Env, customKey?: string): string {
  const ip = getClientIp(request, env);
  const url = new URL(request.url);
  const route = `${request.method}:${url.pathname}`;
  return `rl:${customKey || route}:${ip}`;
}

/**
 * 通用限流：在指定窗口内最多 limit 次
 * 使用内存 + D1 双层（进程重启后 D1 计数恢复；D1 为最终权威计数）
 * 目前仅内存层（足够大部分场景 + Cloudflare WAF 做外层），D1 层保留为接口
 */
export async function rateLimit(
  request: Request,
  env: Env,
  options: {
    limit: number;           // 窗口内最大次数
    windowMs: number;        // 窗口大小（毫秒）
    customKey?: string;      // 自定义 key 前缀（比如针对单独接口："/auth/login"）
  }
): Promise<RateLimitResult> {
  const { limit, windowMs, customKey } = options;
  const key = keyFor(request, env, customKey);
  const now = Date.now();

  // LRU 清理
  if (memoryStore.size > MAX_MEMORY_KEYS) {
    for (const [k, v] of memoryStore) {
      if (v.resetAt < now) memoryStore.delete(k);
      if (memoryStore.size <= MAX_MEMORY_KEYS * 0.7) break;
    }
  }

  const cached = memoryStore.get(key);
  let count: number;
  let resetAt: number;

  if (!cached || cached.resetAt < now) {
    count = 1;
    resetAt = now + windowMs;
  } else {
    count = cached.count + 1;
    resetAt = cached.resetAt;
  }

  memoryStore.set(key, { count, resetAt });

  const limited = count > limit;
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));

  return {
    limited,
    remaining: Math.max(0, limit - count),
    retryAfter,
  };
}

// 预设常用接口限流策略
export const RATE_LIMIT_PRESETS = {
  login:    { limit: 10, windowMs: 10 * 60 * 1000, customKey: 'auth:login' },    // 10 次 / 10 分钟
  register: { limit: 5,  windowMs: 30 * 60 * 1000, customKey: 'auth:register' }, // 5 次 / 30 分钟
  post:     { limit: 30, windowMs: 60 * 60 * 1000, customKey: 'feed:post' },     // 30 条 / 小时
  comment:  { limit: 60, windowMs: 60 * 60 * 1000, customKey: 'feed:comment' },  // 60 条 / 小时
  reset:    { limit: 5,  windowMs: 60 * 60 * 1000, customKey: 'auth:reset' },    // 5 次 / 小时
  codeSend: { limit: 5,  windowMs: 60 * 60 * 1000, customKey: 'auth:codeSend' }, // 5 次 / 小时
  codeLogin:{ limit: 20, windowMs: 10 * 60 * 1000, customKey: 'auth:codeLogin' },// 20 次 / 10 分钟
  general:  { limit: 120, windowMs: 60 * 1000,    customKey: undefined },        // 120 次 / 分钟（通用 IP 级）
};
