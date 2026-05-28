import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUserProfile } from '../../mock';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const menuItems = [
    { icon: '📝', label: '我的评价', path: '/reviews' },
    { icon: '💚', label: '心愿单', path: '/wishlist' },
    { icon: '📊', label: '喝过的记录', path: '/history' },
    { icon: '⚙️', label: '设置', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-cream z-40 pt-4 pb-2 px-4">
        <h1 className="text-xl font-bold text-dark-brown">我的</h1>
      </header>

      <div className="px-4 mt-4">
        <div className="card p-6 text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-milk-tea">
              <img
                src={mockUserProfile.avatar}
                alt={mockUserProfile.nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-matcha rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-dark-brown mt-3">
            {mockUserProfile.nickname}
          </h2>
          <p className="text-sm text-mid-brown mt-1">{mockUserProfile.signature}</p>

          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-dark-brown">
                {mockUserProfile.totalCups}
              </p>
              <p className="text-xs text-mid-brown">喝过</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-dark-brown">
                {mockUserProfile.totalReviews}
              </p>
              <p className="text-xs text-mid-brown">评价</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-dark-brown">
                {formatNumber(mockUserProfile.totalLikes)}
              </p>
              <p className="text-xs text-mid-brown">获赞</p>
            </div>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <h3 className="font-semibold text-dark-brown">我的徽章</h3>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {mockUserProfile.badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-medium transition-opacity ${
                  badge.unlocked ? 'opacity-100' : 'opacity-30 grayscale'
                }`}
                title={badge.unlocked ? badge.name : '未解锁'}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs text-mid-brown text-center">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4 overflow-hidden">
          <div className="border-b border-border">
            <h3 className="px-4 py-3 font-semibold text-dark-brown">功能列表</h3>
          </div>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-cream transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-dark-brown">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-milk-tea to-caramel flex items-center justify-center">
              <span className="text-lg">🎁</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-brown">邀请好友</p>
              <p className="text-sm text-mid-brown">每邀请一位好友得积分</p>
            </div>
            <svg className="w-5 h-5 text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-matcha to-green-400 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-brown">意见反馈</p>
              <p className="text-sm text-mid-brown">帮助我们做得更好</p>
            </div>
            <svg className="w-5 h-5 text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose to-pink-400 flex items-center justify-center">
              <span className="text-lg">ℹ️</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-brown">关于茶语</p>
              <p className="text-sm text-mid-brown">版本 1.0.0</p>
            </div>
            <svg className="w-5 h-5 text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
