// Cloudflare Pages Functions 环境类型定义

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;   // 可选：Resend 邮件服务 API Key，配置后发真实邮件
}
