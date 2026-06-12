import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: 'reviews', label: '我的评价', count: 12 },
    { icon: 'wishlist', label: '心愿单', count: 8 },
    { icon: 'history', label: '喝过的', count: 56 },
    { icon: 'likes', label: '获赞', count: 328 },
  ];

  const settingsItems = [
    { icon: 'settings', label: '设置' },
    { icon: 'invite', label: '邀请好友' },
    { icon: 'feedback', label: '意见反馈' },
    { icon: 'about', label: '关于' },
    { icon: 'logout', label: '退出登录', isLogout: true },
  ];

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'reviews':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'wishlist':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        );
      case 'history':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'likes':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.222 2h-.444a2 2 0 00-2 2v.188a2 2 0 01-1 1.732l-.443.257a2 2 0 01-2 0l-.158-.088a2 2 0 00-2.732 1l-.157.257a2 2 0 001 1.732V10a2 2 0 01-1 1.732l-.158.088a2 2 0 001 3.464l.158.088a2 2 0 011 1.732V18a2 2 0 002 2h.444a2 2 0 002-2v-.188a2 2 0 011-1.732l.443-.257a2 2 0 012 0l.158.088a2 2 0 002.732-1l.157-.257a2 2 0 00-1-1.732V14a2 2 0 011-1.732l.158-.088a2 2 0 00-1-3.464l-.158-.088a2 2 0 01-1-1.732V6a2 2 0 00-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case 'invite':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8m0 0v8l3.5-2" />
            <path d="M3 5a9 9 0 019 9" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'feedback':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'about':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5M19 12H9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4">
        <h1 className="text-xl font-semibold text-text-primary py-3">我的</h1>
      </header>

      <div className="px-4 mt-3">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-gray flex-shrink-0">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={user?.nickname || '用户'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {user?.nickname || user?.username || '用户'}
              </h2>
              <p className="text-sm text-text-gray mt-1">{user?.bio || '暂无签名'}</p>
              
              <div className="flex gap-6 mt-3">
                {menuItems.map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-lg font-semibold text-text-primary">
                      {formatNumber(item.count)}
                    </p>
                    <p className="text-xs text-text-gray">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg mt-4 overflow-hidden">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={item.isLogout ? handleLogout : undefined}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-bg-gray transition-colors ${item.isLogout ? 'text-red-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={item.isLogout ? 'text-red-500' : 'text-text-gray'}>{renderIcon(item.icon)}</div>
                <span className={item.isLogout ? 'text-red-500' : 'text-text-primary'}>{item.label}</span>
              </div>
              {!item.isLogout && (
                <svg className="w-5 h-5 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;