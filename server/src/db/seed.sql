INSERT OR IGNORE INTO users (username, email, password, nickname, avatar, bio) VALUES
('test', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '奶茶爱好者', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test', '每天一杯奶茶，快乐一整天！'),
('milktea_fan', 'fan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '茶控小王', 'https://api.dicebear.com/7.x/avataaars/svg?seed=milktea_fan', '专业奶茶品鉴师，已喝遍全城！'),
('sweet_tooth', 'sweet@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '甜品达人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sweet_tooth', '甜度越高越开心！'),
('tea_master', 'master@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '茶大师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tea_master', '只喝原叶茶底的奶茶');

INSERT OR IGNORE INTO shops (name, brand, description, address, latitude, longitude, rating, priceRange) VALUES
('茶百道', '茶百道', '创立于2008年，主打鲜果茶和创意奶茶，以杨枝甘露和豆乳玉麒麟闻名。', '上海市静安区南京西路1266号', 31.2397, 121.4998, 4.7, '$$'),
('茶颜悦色', '茶颜悦色', '源自长沙的新中式茶饮品牌，以幽兰拿铁和声声乌龙为招牌，茶香浓郁。', '上海市黄浦区淮海中路999号', 31.2346, 121.4854, 4.8, '$$'),
('喜茶', '喜茶', '创立于2012年，以芝士奶盖茶和多肉葡萄闻名，引领新式茶饮潮流。', '上海市浦东新区陆家嘴环路1000号', 31.2397, 121.5079, 4.6, '$$'),
('一点点', '一点点', '台湾连锁奶茶品牌，以丰富的配料选择和实惠的价格深受喜爱。', '上海市徐汇区漕溪北路88号', 31.1987, 121.4369, 4.5, '$'),
('奈雪的茶', '奈雪的茶', '以霸气橙子和草莓魔法棒闻名，茶饮与软欧包的完美结合。', '上海市长宁区虹桥路1号', 31.2167, 121.3964, 4.7, '$$');

INSERT OR IGNORE INTO drinks (shopId, name, category, price, description, rating) VALUES
(1, '杨枝甘露', '果茶', 18, '芒果、西柚、西米、椰浆的完美组合', 4.8),
(1, '豆乳玉麒麟', '奶茶', 16, '黄豆粉+奶盖+奶茶的经典组合', 4.7),
(2, '幽兰拿铁', '奶茶', 16, '红茶茶底+芝士奶盖+碧根果碎', 4.9),
(2, '声声乌龙', '果茶', 15, '白桃乌龙茶底+奶盖', 4.8),
(3, '多肉葡萄', '果茶', 22, '巨峰葡萄+芝士奶盖', 4.8),
(3, '芝士莓莓', '果茶', 20, '新鲜草莓+芝士奶盖', 4.7),
(4, '波霸奶茶', '奶茶', 12, '经典波霸+奶茶', 4.5),
(4, '四季春茶', '纯茶', 8, '清新四季春茶底', 4.4),
(5, '霸气橙子', '果茶', 20, '新鲜橙子+绿茶底', 4.7),
(5, '草莓魔法棒', '面包', 18, '草莓奶油面包', 4.6);

INSERT OR IGNORE INTO wishlists (userId, drinkName, shopName, category, imageUrl, isDrank) VALUES
(1, '杨枝甘露', '茶百道', '果茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink1', 1),
(1, '幽兰拿铁', '茶颜悦色', '奶茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink2', 0),
(1, '多肉葡萄', '喜茶', '果茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink3', 0),
(1, '波霸奶茶', '一点点', '奶茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink4', 1),
(1, '霸气橙子', '奈雪的茶', '果茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink5', 0),
(1, '芝士莓莓', '喜茶', '果茶', 'https://api.dicebear.com/7.x/avataaars/svg?seed=drink6', 0);