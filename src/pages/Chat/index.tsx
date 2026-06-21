import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

interface Message {
  id: number;
  senderId: number;
  content: string;
  username: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await request<{
        success: boolean;
        messages?: Message[];
      }>(API.chats.get(userId));
      if (data.success && data.messages) {
        setMessages(data.messages);
        // 提取对方信息
        const other = data.messages.find((m: any) => m.senderId !== getMyId());
        if (other) {
          setOtherUser({
            id: other.senderId,
            username: other.username,
            nickname: other.nickname,
            avatar: other.avatar,
          });
        }
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  // 从 localStorage 获取当前用户 ID
  const getMyId = () => {
    const token = localStorage.getItem('sintea_token');
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || 0;
    } catch {
      return 0;
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !userId) return;
    setSending(true);
    try {
      await request(API.chats.send, {
        method: 'POST',
        body: JSON.stringify({ toUserId: parseInt(userId), content }),
      });
      setInput('');
      loadMessages();
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userId]);

  useEffect(() => {
    // 滚动到底部
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const myId = getMyId();

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="flex-shrink-0 bg-white px-4 py-3 border-b border-border-light flex items-center gap-3">
        <button
          onClick={() => navigate('/chats')}
          className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser?.avatar && (
          <img src={otherUser.avatar} alt="" className="w-8 h-8 rounded-full" />
        )}
        <span className="font-medium text-text-primary">
          {otherUser?.nickname || otherUser?.username || '用户'}
        </span>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-16 text-text-gray text-sm">暂无消息，发一条打招呼吧</div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === myId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              {!isMine && (
                <img
                  src={msg.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full mr-2 flex-shrink-0 self-end"
                />
              )}
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                  isMine
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-text-primary rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              {isMine && (
                <img
                  src={msg.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full ml-2 flex-shrink-0 self-end"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white px-3 py-2 border-t border-border-light flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息…"
          className="flex-1 h-9 px-3 bg-bg-gray rounded-full text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-40"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
