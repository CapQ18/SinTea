import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// 导入数据库配置
import sequelize from './config/database.js';

// 导入模型
import './models/User.js';
import './models/Shop.js';
import './models/Drink.js';
import './models/Feed.js';
import './models/Comment.js';
import './models/Wishlist.js';
import './models/Chat.js';
import './models/Message.js';

// 路由
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import shopRoutes from './routes/shops.js';
import feedRoutes from './routes/feeds.js';
import wishlistRoutes from './routes/wishlists.js';
import chatRoutes from './routes/chats.js';
import locationRoutes from './routes/locations.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.io 实时通信
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`用户 ${userId} 加入房间`);
  });

  socket.on('send_message', (data) => {
    const { to, message, from } = data;
    io.to(to).emit('receive_message', { from, message, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/locations', locationRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '正弦茶(SinTea) API 服务运行中', version: '1.0.0' });
});

// 启动服务器
const PORT = process.env.PORT || 3001;

sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ SQLite 数据库连接成功，表已同步');
    httpServer.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`🔌 Socket.io 实时通信已启用`);
    });
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败:', err.message);
  });

export { io };
