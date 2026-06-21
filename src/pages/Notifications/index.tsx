import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'treat';
  fromUserId: number;
  fromUsername: string;
  fromNickname: string;
  fromAvatar: string;
  feedId?: number;
  commentContent?: string;
  isRead: number;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await request<{
        success: boolean;
        notifications?: Notification[];
      }>(API.notifications.list);
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await request(`${API.notifications.readAll}`, { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadNotifications();
    markAllRead(); // 进入页面即标已读
  }, []);

  const handleClick = (notif: Notification) => {
    if (notif.feedId) {
      navigate(`/detail/${notif.feedId}`);
    } else if (notif.type === 'follow' || notif.type === 'treat') {
      navigate(`/user/${notif.fromUserId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
        );
      case 'treat':
        return (
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-lg">🧋</span>
          </div>
        );
    }
  };

  const getText = (notif: Notification) => {
    const name = notif.fromNickname || notif.fromUsername || '用户';
    switch (notif.type) {
      case 'like':
        return `${name} 赞了你的动态`;
      case 'comment':
        return `${name} 评论了你的动态: "${notif.commentContent || ''}"`;
      case 'follow':
        return `${name} 关注了你`;
      case 'treat':
        return `${name} 请你喝 ${notif.commentContent || '奶茶'}！🧋`;
    }
  };

  const getTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return '刚刚';
      if (mins < 60) return `${mins}分钟前`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}小时前`;
      return d.toLocaleDateString('zh-CN');
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">通知</h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary font-medium"
          >
            全部已读
          </button>
        )}
      </header>

      <div className="px-4 pt-2">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-text-gray text-sm">{error}</div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-16 text-text-gray">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p className="text-sm">暂无通知</p>
          </div>
        )}

        <div className="space-y-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                notif.isRead ? 'bg-white' : 'bg-primary/5'
              }`}
              onClick={() => handleClick(notif)}
            >
              {getIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{getText(notif)}</p>
                <p className="text-xs text-text-gray mt-0.5">{getTime(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
