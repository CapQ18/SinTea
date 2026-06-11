import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: 'home', label: '首页' },
    { path: '/discover', icon: 'discover', label: '发现' },
    { path: '/post', icon: 'post', label: '发布', isCenter: true },
    { path: '/wishlist', icon: 'wishlist', label: '心愿单' },
    { path: '/profile', icon: 'profile', label: '我的' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const renderIcon = (icon: string, active: boolean) => {
    const color = active ? 'currentColor' : '#999999';
    const fill = active ? 'currentColor' : 'none';
    
    switch (icon) {
      case 'home':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'discover':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <circle cx="11" cy="11" r="3" />
          </svg>
        );
      case 'post':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'wishlist':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-border-light flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`
            flex flex-col items-center justify-center transition-all duration-200
            ${item.isCenter 
              ? 'w-12 h-12 rounded-full bg-primary text-white shadow-md -mt-3 active:scale-95' 
              : 'flex-1 py-1 active:scale-95'
            }
          `}
          style={{
            marginBottom: item.isCenter ? 0 : '4px',
          }}
        >
          <div className={`${!item.isCenter && (isActive(item.path) ? 'text-primary' : 'text-text-gray')}`}>
            {renderIcon(item.icon, isActive(item.path))}
          </div>
          {!item.isCenter && (
            <span className={`text-xs mt-0.5 ${isActive(item.path) ? 'text-primary font-medium' : 'text-text-gray'}`}>
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default NavBar;
