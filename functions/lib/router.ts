// 轻量路由分发器（< 40 行，零依赖）
// 支持路径参数匹配，如 /api/feeds/:id/like

import type { Env } from './env';
import { handleOptions, error } from './response';

const CACHE_TTL = 30;

export type Handler = (
  request: Request,
  env: Env,
  params: Record<string, string>,
) => Promise<Response>;

export interface RouteDefinition {
  method: string;
  path: string; // 如 '/api/feeds/:id/like'
  handler: Handler;
}

function pathToRegex(path: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const regexStr = path
    .replace(/\//g, '\\/')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
  return {
    regex: new RegExp(`^${regexStr}$`),
    paramNames,
  };
}

export class Router {
  private routes: Array<{
    method: string;
    regex: RegExp;
    paramNames: string[];
    handler: Handler;
  }> = [];

  add(method: string, path: string, handler: Handler): void {
    const { regex, paramNames } = pathToRegex(path);
    this.routes.push({ method: method.toUpperCase(), regex, paramNames, handler });
  }

  get(path: string, handler: Handler): void {
    this.add('GET', path, handler);
  }
  post(path: string, handler: Handler): void {
    this.add('POST', path, handler);
  }
  put(path: string, handler: Handler): void {
    this.add('PUT', path, handler);
  }
  delete(path: string, handler: Handler): void {
    this.add('DELETE', path, handler);
  }

  async dispatch(request: Request, env: Env): Promise<Response | null> {
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    if (!pathname.startsWith('/api/')) {
      return null;
    }

    const isCacheable = method === 'GET' && !url.searchParams.has('no-cache');

    if (isCacheable) {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;
      const cached = await cache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = route.regex.exec(pathname);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      try {
        const response = await route.handler(request, env, params);

        if (isCacheable && response.ok) {
          const headers = new Headers(response.headers);
          headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
          headers.set('X-Cache', 'miss');
          const cachedResponse = new Response(response.body, {
            status: response.status,
            headers,
          });
          const cache = caches.default;
          cache.put(new Request(url.toString(), request), cachedResponse.clone());
          return cachedResponse;
        }

        return response;
      } catch (err) {
        return error(
          '服务器错误: ' + (err instanceof Error ? err.message : String(err)),
          500,
        );
      }
    }

    return error('接口不存在', 404);
  }
}
