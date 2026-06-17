import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const upload = new Hono();

upload.post('/image', authMiddleware, async (c) => {
  const R2_BUCKET = c.env.R2_IMAGES;
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, message: '请选择文件' }, 400);
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, message: '仅支持图片格式' }, 400);
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: false, message: '文件大小不能超过5MB' }, 400);
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    await R2_BUCKET.put(fileName, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    const imageUrl = `https://sintea-api.xxx.workers.dev/api/upload/image/${fileName}`;
    
    return c.json({ success: true, url: imageUrl });
  } catch (error) {
    return c.json({ success: false, message: '上传失败' }, 500);
  }
});

upload.get('/image/:filename', async (c) => {
  const R2_BUCKET = c.env.R2_IMAGES;
  const filename = c.req.param('filename');
  
  try {
    const object = await R2_BUCKET.get(filename);
    
    if (!object) {
      return c.json({ success: false, message: '图片不存在' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return c.json({ success: false, message: '获取图片失败' }, 500);
  }
});

export default upload;