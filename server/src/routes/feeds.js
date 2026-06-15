import express from 'express';
import { Op } from 'sequelize';
import Feed from '../models/Feed.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Drink from '../models/Drink.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// 获取动态列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const where = userId ? { authorId: userId } : {};

    const feeds = await Feed.findAll({
      where,
      include: [
        { model: User, as: 'User' },
        { model: Shop },
        { model: Drink }
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    const total = await Feed.count({ where });

    res.json({
      feeds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取动态列表失败: ' + error.message });
  }
});

// 获取单个动态
router.get('/:id', async (req, res) => {
  try {
    const feed = await Feed.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User' },
        { model: Shop },
        { model: Drink }
      ]
    });

    if (!feed) {
      return res.status(404).json({ error: '动态不存在' });
    }

    // 获取评论
    const comments = await Comment.findAll({
      where: { feedId: req.params.id },
      include: [{ model: User, as: 'User' }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ feed, comments });
  } catch (error) {
    res.status(500).json({ error: '获取动态失败: ' + error.message });
  }
});

// 发布动态
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, images, shopId, drinkId, sweetness, teaFlavor, milkFlavor, texture, coldness, appearance } = req.body;

    const feed = await Feed.create({
      authorId: req.userId,
      content,
      images: images || [],
      shopId,
      drinkId,
      sweetness: sweetness || 0,
      teaFlavor: teaFlavor || 0,
      milkFlavor: milkFlavor || 0,
      texture: texture || 0,
      coldness: coldness || 0,
      appearance: appearance || 0
    });

    const populatedFeed = await Feed.findByPk(feed.id, {
      include: [
        { model: User, as: 'User' },
        { model: Shop },
        { model: Drink }
      ]
    });

    res.status(201).json({ message: '发布成功', feed: populatedFeed });
  } catch (error) {
    res.status(500).json({ error: '发布动态失败: ' + error.message });
  }
});

// 上传动态图片
router.post('/images', authenticate, upload.array('images', 9), async (req, res) => {
  try {
    const images = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: '上传失败: ' + error.message });
  }
});

// 删除动态
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const feed = await Feed.findByPk(req.params.id);

    if (!feed) {
      return res.status(404).json({ error: '动态不存在' });
    }

    if (feed.authorId !== req.userId) {
      return res.status(403).json({ error: '无权限删除' });
    }

    await Comment.destroy({ where: { feedId: req.params.id } });
    await Feed.destroy({ where: { id: req.params.id } });

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除失败: ' + error.message });
  }
});

// 点赞动态
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const feed = await Feed.findByPk(req.params.id);

    if (!feed) {
      return res.status(404).json({ error: '动态不存在' });
    }

    let likes = feed.likes || [];
    const isLiked = likes.includes(req.userId);

    if (isLiked) {
      likes = likes.filter(id => id !== req.userId);
    } else {
      likes.push(req.userId);
    }

    await Feed.update({ likes }, { where: { id: req.params.id } });

    res.json({ message: isLiked ? '已取消点赞' : '点赞成功', liked: !isLiked });
  } catch (error) {
    res.status(500).json({ error: '操作失败: ' + error.message });
  }
});

// 评论动态
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;

    const feed = await Feed.findByPk(req.params.id);
    if (!feed) {
      return res.status(404).json({ error: '动态不存在' });
    }

    const comment = await Comment.create({
      feedId: req.params.id,
      authorId: req.userId,
      content,
      parentCommentId
    });

    const populatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'User' }]
    });

    res.status(201).json({ message: '评论成功', comment: populatedComment });
  } catch (error) {
    res.status(500).json({ error: '评论失败: ' + error.message });
  }
});

export default router;
