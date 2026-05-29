// Cloudflare Pages Worker 路由处理
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // 如果是 API 请求或静态资源，直接返回
  if (path.startsWith('/api/') || 
      path.startsWith('/assets/') || 
      path.startsWith('/favicon.ico') ||
      path.startsWith('/vite.svg') ||
      path.includes('.') && !path.endsWith('/')) {
    return await fetch(request)
  }

  // 所有其他请求都返回 index.html，让 React Router 处理
  return await fetch('/index.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}