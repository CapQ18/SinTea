import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// 获取用户资料
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败: ' + error.message });
  }
});

// 更新用户资料
router.put('/', authenticate, async (req, res) => {
  try {
    const { username, bio, avatar, sweetness, teaFlavor, milkFlavor, texture, coldness, appearance } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;
    if (sweetness !== undefined) updates.sweetness = sweetness;
    if (teaFlavor !== undefined) updates.teaFlavor = teaFlavor;
    if (milkFlavor !== undefined) updates.milkFlavor = milkFlavor;
    if (texture !== undefined) updates.texture = texture;
    if (coldness !== undefined) updates.coldness = coldness;
    if (appearance !== undefined) updates.appearance = appearance;

    const [, [user]] = await User.update(updates, {
      where: { id: req.userId },
      returning: true
    });

    res.json({ message: '更新成功', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: '更新失败: ' + error.message });
  }
});

// 上传头像
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择图片' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const [, [user]] = await User.update(
      { avatar: avatarUrl },
      { where: { id: req.userId }, returning: true }
    );

    res.json({ message: '上传成功', avatar: avatarUrl, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: '上传失败: ' + error.message });
  }
});

export default router;
