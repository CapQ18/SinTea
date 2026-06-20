// SinTea API — Cloudflare Pages Functions 入口
// 所有 /api/* 请求由路由分发器处理，其余交给 SPA 静态资源

import { Router } from './lib/router';
import type { Env } from './lib/env';

// 导入各路由模块
import { registerRoutes as registerAuth } from './lib/routes/auth';
import { registerRoutes as registerUsers } from './lib/routes/users';
import { registerRoutes as registerFeeds } from './lib/routes/feeds';
import { registerRoutes as registerShops } from './lib/routes/shops';
import { registerRoutes as registerWishlists } from './lib/routes/wishlists';
import { registerRoutes as registerFollows } from './lib/routes/follows';

// 构建路由表
const router = new Router();

// 健康检查
router.get('/api/health', async () => {
  return new Response(
    JSON.stringify({ success: true, message: 'SinTea API is running!' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
});

registerAuth(router);
registerUsers(router);
registerFeeds(router);
registerShops(router);
registerWishlists(router);
registerFollows(router);

// Pages Functions handler
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 尝试 API 路由分发
  const apiResponse = await router.dispatch(request, env);
  if (apiResponse) {
    return apiResponse;
  }

  // 非 /api 路径，交给 Pages 静态资源（SPA 路由）
  return context.next();
};
