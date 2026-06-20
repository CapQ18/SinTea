-- Phase 3 数据表迁移：店铺图片数据库化

-- 添加 images 列（JSON 数组，存储图片 URL）
ALTER TABLE shops ADD COLUMN images TEXT;

-- 为现有 5 家店铺填充默认图片
UPDATE shops SET images = '["https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400","https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400","https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"]' WHERE id = 1;
UPDATE shops SET images = '["https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400","https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400","https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400"]' WHERE id = 2;
UPDATE shops SET images = '["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400","https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400","https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400"]' WHERE id = 3;
UPDATE shops SET images = '["https://images.unsplash.com/photo-1571805341302-f85782f80349?w=400","https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400","https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400"]' WHERE id = 4;
UPDATE shops SET images = '["https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400","https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400","https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400"]' WHERE id = 5;
