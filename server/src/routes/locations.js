import express from 'express';
import Shop from '../models/Shop.js';
import { Op } from 'sequelize';

const router = express.Router();

// Haversine公式：计算两点之间的真实距离（单位：公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 获取城市列表（用于用户手动选择）
 */
router.get('/cities', async (req, res) => {
  try {
    // 获取所有有位置信息的城市
    const shops = await Shop.findAll({
      attributes: ['address'],
      where: { address: { [Op.ne]: null, [Op.ne]: '' } }
    });

    // 提取城市名称（简单处理）
    const cities = [...new Set(shops.map(shop => {
      const addr = shop.address;
      if (addr.includes('省')) return addr.substring(0, addr.indexOf('省') + 1);
      if (addr.includes('市')) return addr.substring(0, addr.indexOf('市') + 1);
      return addr;
    }))].slice(0, 50);

    res.json({ cities });
  } catch (error) {
    res.status(500).json({ error: '获取城市列表失败' });
  }
});

/**
 * 根据城市名称搜索奶茶店
 */
router.get('/city/:city', async (req, res) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;
    const cityName = req.params.city;

    const shops = await Shop.findAll({
      where: {
        address: { [Op.like]: `%${cityName}%` }
      },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    const total = await Shop.count({
      where: { address: { [Op.like]: `%${cityName}%` } }
    });

    res.json({
      message: `「${cityName}」的奶茶店`,
      shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '搜索城市奶茶店失败' });
  }
});

/**
 * 手动输入位置搜索（用户输入经纬度）
 */
router.get('/search', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: '请提供经纬度' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistance = parseFloat(radius);

    const shops = await Shop.findAll({
      where: {
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      }
    });

    const shopsWithDistance = shops
      .map(shop => ({
        ...shop.toJSON(),
        distance: Math.round(calculateDistance(userLat, userLng, shop.latitude, shop.longitude) * 100) / 100
      }))
      .filter(shop => shop.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      message: '附近奶茶店（按真实距离排序）',
      shops: shopsWithDistance,
      total: shopsWithDistance.length,
      userLocation: { lat: userLat, lng: userLng },
      radius: maxDistance
    });
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

export default router;