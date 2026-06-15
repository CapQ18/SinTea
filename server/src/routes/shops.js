import express from 'express';
import { Op } from 'sequelize';
import Shop from '../models/Shop.js';
import Drink from '../models/Drink.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// 获取所有奶茶店
router.get('/', async (req, res) => {
  try {
    const { search, brand, page = 1, limit = 10 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    if (brand) {
      where.brand = brand;
    }

    const shops = await Shop.findAll({
      where,
      include: [{ model: User, as: 'User' }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    const total = await Shop.count({ where });

    res.json({
      shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取奶茶店列表失败: ' + error.message });
  }
});

// 获取单个奶茶店
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User' },
        { model: Drink }
      ]
    });

    if (!shop) {
      return res.status(404).json({ error: '奶茶店不存在' });
    }

    res.json({ shop });
  } catch (error) {
    res.status(500).json({ error: '获取奶茶店信息失败: ' + error.message });
  }
});

// 创建奶茶店
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, brand, description, address, latitude, longitude, priceRange, tags } = req.body;

    const shop = await Shop.create({
      name,
      brand,
      description,
      address,
      latitude,
      longitude,
      priceRange,
      tags: tags || [],
      createdBy: req.userId
    });

    res.status(201).json({ message: '创建成功', shop });
  } catch (error) {
    res.status(500).json({ error: '创建奶茶店失败: ' + error.message });
  }
});

// 更新奶茶店
router.put('/:id', authenticate, async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({ error: '奶茶店不存在' });
    }

    if (shop.createdBy !== req.userId) {
      return res.status(403).json({ error: '无权限修改' });
    }

    const updates = { ...req.body, updatedAt: Date.now() };
    const [, [updatedShop]] = await Shop.update(updates, {
      where: { id: req.params.id },
      returning: true
    });

    res.json({ message: '更新成功', shop: updatedShop });
  } catch (error) {
    res.status(500).json({ error: '更新失败: ' + error.message });
  }
});

// 上传奶茶店图片
router.post('/:id/images', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      return res.status(404).json({ error: '奶茶店不存在' });
    }

    const images = req.files.map(file => `/uploads/${file.filename}`);
    const currentImages = shop.images || [];
    const allImages = [...currentImages, ...images];

    await Shop.update({ images: allImages }, { where: { id: req.params.id } });

    res.json({ message: '上传成功', images });
  } catch (error) {
    res.status(500).json({ error: '上传失败: ' + error.message });
  }
});

// 添加饮品
router.post('/:id/drinks', authenticate, async (req, res) => {
  try {
    const { name, price, description, tags, sweetness, teaFlavor, milkFlavor, texture, coldness, appearance, image } = req.body;

    const drink = await Drink.create({
      name,
      shopId: req.params.id,
      price,
      description,
      tags: tags || [],
      sweetness: sweetness || 5,
      teaFlavor: teaFlavor || 5,
      milkFlavor: milkFlavor || 5,
      texture: texture || 5,
      coldness: coldness || 5,
      appearance: appearance || 5,
      image
    });

    res.status(201).json({ message: '添加成功', drink });
  } catch (error) {
    res.status(500).json({ error: '添加饮品失败: ' + error.message });
  }
});

// 获取饮品列表
router.get('/:id/drinks', async (req, res) => {
  try {
    const drinks = await Drink.findAll({
      where: { shopId: req.params.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ drinks });
  } catch (error) {
    res.status(500).json({ error: '获取饮品列表失败: ' + error.message });
  }
});

export default router;
