// Cloudflare Pages Functions - 后端 API
// 仅处理 /api/* 路径，其他路径交给前端 SPA

interface Env {
  DB: D1Database;
}

// 简单的 token 生成
function generateToken(userId: number, username: string): string {
  const payload = {
    id: userId,
    username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  return btoa(JSON.stringify(payload));
}

function verifyToken(token: string): { id: number; username: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, username: payload.username };
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sintea_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // OPTIONS 预检
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    // 健康检查
    if (path === '/api/health' && method === 'GET') {
      return jsonResponse({ success: true, message: 'SinTea API is running!' });
    }

    // 注册
    if (path === '/api/auth/register' && method === 'POST') {
      const body = await request.json() as any;
      const { username, email, password, confirmPassword, nickname } = body;

      if (!username || !email || !password) {
        return jsonResponse({ success: false, message: '请填写完整信息' }, 400);
      }
      if (password !== confirmPassword) {
        return jsonResponse({ success: false, message: '两次密码不一致' }, 400);
      }

      const existing = await env.DB.prepare(
        'SELECT id FROM users WHERE username = ? OR email = ?'
      ).bind(username, email).first();

      if (existing) {
        return jsonResponse({ success: false, message: '用户名或邮箱已存在' }, 400);
      }

      const hashed = await hashPassword(password);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

      const result = await env.DB.prepare(
        'INSERT INTO users (username, email, password, nickname, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(username, email, hashed, nickname || username, avatar, '').run();

      const userId = Number(result.lastInsertRowid);
      const token = generateToken(userId, username);

      return jsonResponse({
        success: true,
        message: '注册成功',
        token,
        user: { id: userId, username, email, nickname: nickname || username, avatar }
      });
    }

    // 登录
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await request.json() as any;
      const { username, password } = body;

      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE username = ?'
      ).bind(username).first() as any;

      if (!user) {
        return jsonResponse({ success: false, message: '用户不存在' }, 400);
      }

      const hashed = await hashPassword(password);
      if (hashed !== user.password) {
        return jsonResponse({ success: false, message: '密码错误' }, 400);
      }

      const token = generateToken(user.id, user.username);
      return jsonResponse({
        success: true,
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio
        }
      });
    }

    // 获取当前用户
    if (path === '/api/auth/me' && method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '未授权' }, 401);
      }

      const user = await env.DB.prepare(
        'SELECT id, username, email, nickname, avatar, bio FROM users WHERE id = ?'
      ).bind(payload.id).first();

      if (!user) {
        return jsonResponse({ success: false, message: '用户不存在' }, 404);
      }

      return jsonResponse({ success: true, user });
    }

    // 用户列表
    if (path === '/api/users' && method === 'GET') {
      const results = await env.DB.prepare(
        'SELECT id, username, email, nickname, avatar, bio FROM users'
      ).all();

      return jsonResponse({ success: true, users: results.results });
    }

    // 店铺列表
    if (path === '/api/shops' && method === 'GET') {
      const results = await env.DB.prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops'
      ).all();

      const shopImages: Record<number, string[]> = {
        1: [
          'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
          'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
        ],
        2: [
          'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
          'https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400',
          'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
        ],
        3: [
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
          'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
          'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
        ],
        4: [
          'https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400',
          'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
          'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
        ],
        5: [
          'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400',
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
          'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
        ],
      };

      const shopsWithImages = (results.results as any[]).map(shop => ({
        ...shop,
        id: String(shop.id),
        images: shopImages[shop.id] || shopImages[1]
      }));

      return jsonResponse({ success: true, shops: shopsWithImages });
    }

    // 附近店铺
    if (path === '/api/shops/nearby' && method === 'GET') {
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lng = parseFloat(url.searchParams.get('lng') || '0');
      const radius = parseFloat(url.searchParams.get('radius') || '10');

      const results = await env.DB.prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops'
      ).all();

      const shopImages: Record<number, string[]> = {
        1: ['https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400'],
        2: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400'],
        3: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'],
        4: ['https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400'],
        5: ['https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400'],
      };

      const shopsWithDistance = (results.results as any[]).map(shop => {
        let distance: number | null = null;
        if (shop.latitude && shop.longitude) {
          const R = 6371;
          const dLat = (shop.latitude - lat) * Math.PI / 180;
          const dLng = (shop.longitude - lng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat * Math.PI / 180) * Math.cos(shop.latitude * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = Math.round(R * c * 100) / 100;
        }
        return {
          ...shop,
          id: String(shop.id),
          distance,
          images: shopImages[shop.id] || shopImages[1]
        };
      })
        .filter((shop: any) => shop.distance !== null && shop.distance <= radius)
        .sort((a: any, b: any) => a.distance - b.distance);

      return jsonResponse({ success: true, shops: shopsWithDistance, count: shopsWithDistance.length });
    }

    // 店铺详情
    const shopDetailMatch = path.match(/^\/api\/shops\/(\d+)$/);
    if (shopDetailMatch && method === 'GET') {
      const shopId = parseInt(shopDetailMatch[1]);
      const shop = await env.DB.prepare(
        'SELECT id, name, brand, description, address, latitude, longitude, rating, priceRange FROM shops WHERE id = ?'
      ).bind(shopId).first();

      if (!shop) {
        return jsonResponse({ success: false, message: '店铺不存在' }, 404);
      }

      const drinks = await env.DB.prepare(
        'SELECT id, name, category, price, description, rating, imageUrl FROM drinks WHERE shopId = ?'
      ).bind(shopId).all();

      return jsonResponse({
        success: true,
        shop: { ...shop, id: String(shop.id), images: [`https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400`] },
        drinks: drinks.results
      });
    }

    // 动态列表
    if (path === '/api/feeds' && method === 'GET') {
      const results = await env.DB.prepare(
        'SELECT f.*, u.username, u.nickname, u.avatar FROM feeds f JOIN users u ON f.userId = u.id ORDER BY f.createdAt DESC LIMIT 50'
      ).all();

      const feedsWithData = await Promise.all((results.results as any[]).map(async (feed: any) => {
        const comments = await env.DB.prepare(
          'SELECT c.*, u.username, u.nickname, u.avatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.feedId = ? ORDER BY c.createdAt DESC'
        ).bind(feed.id).all();

        const likeCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM likes WHERE feedId = ?'
        ).bind(feed.id).first();

        return {
          ...feed,
          images: feed.images ? JSON.parse(feed.images) : [],
          comments: comments.results,
          likes: likeCount ? (likeCount as any).count : 0
        };
      }));

      return jsonResponse({ success: true, feeds: feedsWithData });
    }

    // 发布动态
    if (path === '/api/feeds' && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }

      const body = await request.json() as any;
      const { shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance } = body;
      const imagesJson = images ? JSON.stringify(images) : null;

      const result = await env.DB.prepare(
        'INSERT INTO feeds (userId, shopName, drinkName, content, type, rating, images, sweetness, tea, milk, taste, coolness, appearance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(payload.id, shopName, drinkName, content, type || 'neutral', rating || 3, imagesJson, sweetness || 50, tea || 50, milk || 50, taste || 50, coolness || 50, appearance || 50).run();

      return jsonResponse({ success: true, feedId: Number(result.lastInsertRowid) });
    }

    // 心愿单列表
    if (path === '/api/wishlists' && method === 'GET') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }

      const results = await env.DB.prepare(
        'SELECT * FROM wishlists WHERE userId = ? ORDER BY createdAt DESC'
      ).bind(payload.id).all();

      return jsonResponse({ success: true, wishlists: results.results });
    }

    // 创建心愿单
    if (path === '/api/wishlists' && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }

      const body = await request.json() as any;
      const { shopName, drinkName, notes } = body;

      const result = await env.DB.prepare(
        'INSERT INTO wishlists (userId, shopName, drinkName, notes) VALUES (?, ?, ?, ?)'
      ).bind(payload.id, shopName, drinkName, notes || '').run();

      return jsonResponse({ success: true, wishlistId: Number(result.lastInsertRowid) });
    }

    // 点赞
    const likeMatch = path.match(/^\/api\/feeds\/(\d+)\/like$/);
    if (likeMatch && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }

      const feedId = parseInt(likeMatch[1]);
      const existing = await env.DB.prepare(
        'SELECT id FROM likes WHERE userId = ? AND feedId = ?'
      ).bind(payload.id, feedId).first();

      if (existing) {
        await env.DB.prepare('DELETE FROM likes WHERE userId = ? AND feedId = ?').bind(payload.id, feedId).run();
      } else {
        await env.DB.prepare('INSERT INTO likes (userId, feedId) VALUES (?, ?)').bind(payload.id, feedId).run();
      }

      const likeCount = await env.DB.prepare('SELECT COUNT(*) as count FROM likes WHERE feedId = ?').bind(feedId).first();
      await env.DB.prepare('UPDATE feeds SET likes = ? WHERE id = ?').bind((likeCount as any).count, feedId).run();

      return jsonResponse({ success: true, liked: !existing, likes: (likeCount as any).count });
    }

    // 评论
    const commentMatch = path.match(/^\/api\/feeds\/(\d+)\/comments$/);
    if (commentMatch && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
        return jsonResponse({ success: false, message: '请先登录' }, 401);
      }

      const feedId = parseInt(commentMatch[1]);
      const body = await request.json() as any;
      const { content } = body;

      const result = await env.DB.prepare(
        'INSERT INTO comments (feedId, userId, content) VALUES (?, ?, ?)'
      ).bind(feedId, payload.id, content).run();

      return jsonResponse({ success: true, commentId: Number(result.lastInsertRowid) });
    }

    // 其他 /api/* 路径
    if (path.startsWith('/api/')) {
      return jsonResponse({ success: false, message: '接口不存在' }, 404);
    }

    // 非 /api/ 路径，交给 Pages 静态资源处理（SPA 路由）
    // 通过返回 next() 让 Pages 继续处理
    return (context as any).next();

  } catch (error) {
    return jsonResponse({ success: false, message: '服务器错误: ' + (error as Error).message }, 500);
  }
};
