import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/discover', icon: 'discover', label: '发现' },
  { path: '/post', icon: 'post', label: '发布' },
  { path: '/wishlist', icon: 'wishlist', label: '心愿单' },
  { path: '/profile', icon: 'profile', label: '我的' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPath = () => {
    if (location.pathname === '/') return '/';
    if (location.pathname === '/post') return '/post';
    if (location.pathname === '/wishlist') return '/wishlist';
    if (location.pathname === '/profile') return '/profile';
    return '/discover';
  };

  const currentPath = getCurrentPath();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-all ${
                isActive ? 'text-primary' : 'text-text-gray'
              }`}
            >
              {item.path === '/post' ? (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white scale-105' 
                    : 'bg-gradient-to-br from-secondary-light to-accent text-primary-dark'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <svg className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
                    {item.icon === 'home' && (
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    )}
                    {item.icon === 'discover' && (
                      <circle cx="12" cy="12" r="10" />
                    )}
                    {item.icon === 'wishlist' && (
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    )}
                    {item.icon === 'profile' && (
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    )}
                  </svg>
                </div>
              )}
              <span className={`text-xs font-medium transition-all ${isActive ? 'text-primary scale-105' : 'text-text-gray'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;