addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  if (path.startsWith('/api/') || path.startsWith('/assets/')) {
    return await fetch(request)
  }

  return await fetch('/index.html')
}