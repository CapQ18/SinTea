import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/discover', icon: '🔍', label: '发现' },
    { path: '/post', icon: '✏️', label: '发布', isCenter: true },
    { path: '/wishlist', icon: '💚', label: '心愿' },
    { path: '/profile', icon: '👤', label: '我的' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`
            flex flex-col items-center justify-center transition-all duration-200
            ${item.isCenter 
              ? 'w-14 h-14 rounded-full bg-milk-tea text-white shadow-lg -mt-4 active:scale-95' 
              : 'flex-1 py-1 active:scale-95'
            }
          `}
          style={{
            marginBottom: item.isCenter ? 0 : '4px',
          }}
        >
          <span className={`text-xl ${!item.isCenter && (isActive(item.path) ? 'text-milk-tea' : 'text-gray')}`}>
            {item.icon}
          </span>
          {!item.isCenter && (
            <span className={`text-xs mt-0.5 ${isActive(item.path) ? 'text-milk-tea font-medium' : 'text-gray'}`}>
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default NavBar;
