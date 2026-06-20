// Cloudflare Pages Functions 环境类型定义

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}
