import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

interface ChatPreview {
  id: number;
  otherUser: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    setLoading(true);
    try {
      const data = await request<{ success: boolean; chats?: ChatPreview[] }>(
        API.chats.list
      );
      if (data.success && data.chats) {
        setChats(data.chats);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

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
      <header className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">消息</h1>
        </div>
      </header>

      <div>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="text-center py-16 text-text-gray">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p className="text-sm">暂无消息</p>
          </div>
        )}

        {chats.map((chat) => (
          <div
            key={chat.id}
            className="bg-white px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50 border-b border-border-light"
            onClick={() => navigate(`/chat/${chat.otherUser.id}`)}
          >
            <div className="relative">
              <img
                src={chat.otherUser.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover bg-gray-100"
              />
              {chat.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {chat.otherUser.nickname || chat.otherUser.username}
                </span>
                <span className="text-xs text-text-gray">
                  {getTime(chat.lastMessageTime)}
                </span>
              </div>
              <p className="text-xs text-text-gray mt-0.5 truncate">
                {chat.lastMessage || '暂无消息'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
