import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Shop from '../models/Shop.js';
import Drink from '../models/Drink.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取当前用户的心愿单
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.userId };

    if (status) {
      where.status = status;
    }

    const wishlists = await Wishlist.findAll({
      where,
      include: [Shop, Drink],
      order: [['createdAt', 'DESC']]
    });

    res.json({ wishlists });
  } catch (error) {
    res.status(500).json({ error: '获取心愿单失败: ' + error.message });
  }
});

// 添加到心愿单
router.post('/', authenticate, async (req, res) => {
  try {
    const { shopId, drinkId, note } = req.body;

    // 获取饮品信息
    const drink = await Drink.findByPk(drinkId);
    if (!drink) {
      return res.status(404).json({ error: '饮品不存在' });
    }

    // 检查是否已存在
    const existing = await Wishlist.findOne({
      where: { userId: req.userId, drinkId }
    });

    if (existing) {
      return res.status(400).json({ error: '该饮品已在心愿单中' });
    }

    const wishlist = await Wishlist.create({
      userId: req.userId,
      shopId,
      drinkId,
      drinkName: drink.name,
      drinkImage: drink.image,
      note: note || ''
    });

    const populated = await Wishlist.findByPk(wishlist.id, {
      include: [Shop, Drink]
    });

    res.status(201).json({ message: '添加成功', wishlist: populated });
  } catch (error) {
    res.status(500).json({ error: '添加失败: ' + error.message });
  }
});

// 更新心愿单状态
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, note, rating } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (note !== undefined) updates.note = note;
    if (rating !== undefined) updates.rating = rating;

    const [, [wishlist]] = await Wishlist.update(updates, {
      where: { id: req.params.id, userId: req.userId },
      returning: true,
      include: [Shop, Drink]
    });

    if (!wishlist) {
      return res.status(404).json({ error: '心愿单不存在' });
    }

    const populated = await Wishlist.findByPk(wishlist.id, {
      include: [Shop, Drink]
    });

    res.json({ message: '更新成功', wishlist: populated });
  } catch (error) {
    res.status(500).json({ error: '更新失败: ' + error.message });
  }
});

// 从心愿单删除
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await Wishlist.destroy({
      where: { id: req.params.id, userId: req.userId }
    });

    if (result === 0) {
      return res.status(404).json({ error: '心愿单不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除失败: ' + error.message });
  }
});

export default router;
