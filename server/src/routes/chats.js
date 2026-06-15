import express from 'express';
import { Op } from 'sequelize';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取聊天列表
router.get('/', authenticate, async (req, res) => {
  try {
    // 查询用户参与的所有聊天
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] }
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // 过滤出当前用户参与的聊天
    const userChats = chats.filter(chat => 
      chat.Users.some(u => u.id === req.userId)
    );

    res.json({ chats: userChats });
  } catch (error) {
    res.status(500).json({ error: '获取聊天列表失败: ' + error.message });
  }
});

// 获取与指定用户的聊天记录
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // 查找或创建聊天
    let chat = await Chat.findOne({
      include: [{ model: User, through: { attributes: [] } }]
    });

    if (!chat) {
      // 创建新聊天
      chat = await Chat.create();
      // 添加参与者
      const user1 = await User.findByPk(req.userId);
      const user2 = await User.findByPk(req.params.userId);
      await chat.addUsers([user1, user2]);
    }

    // 获取消息
    const messages = await Message.findAll({
      where: { chatId: chat.id },
      include: [{ model: User, as: 'User' }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    // 标记消息为已读
    await Message.update(
      { isRead: true },
      { where: { chatId: chat.id, senderId: { [Op.ne]: req.userId }, isRead: false } }
    );

    res.json({ chat, messages });
  } catch (error) {
    res.status(500).json({ error: '获取聊天记录失败: ' + error.message });
  }
});

// 发送消息
router.post('/', authenticate, async (req, res) => {
  try {
    const { to, content, type = 'text', imageUrl } = req.body;

    // 查找或创建聊天
    let chat = await Chat.findOne({
      include: [{ model: User, through: { attributes: [] } }]
    });

    if (!chat) {
      chat = await Chat.create();
      const user1 = await User.findByPk(req.userId);
      const user2 = await User.findByPk(to);
      await chat.addUsers([user1, user2]);
    }

    // 创建消息
    const message = await Message.create({
      chatId: chat.id,
      senderId: req.userId,
      content,
      type,
      imageUrl
    });

    // 更新聊天最后消息
    await Chat.update(
      {
        lastMessageContent: content,
        lastMessageSenderId: req.userId,
        lastMessageTimestamp: Date.now()
      },
      { where: { id: chat.id } }
    );

    const populatedMessage = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'User' }]
    });

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ error: '发送消息失败: ' + error.message });
  }
});

// 获取未读消息数
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.count({
      where: {
        senderId: { [Op.ne]: req.userId },
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: '获取未读数失败: ' + error.message });
  }
});

export default router;
