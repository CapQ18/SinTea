import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PostReviewPage from './pages/PostReviewPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

const DiscoverPage: React.FC = () => (
  <div className="min-h-screen bg-cream flex flex-col items-center justify-center pb-20">
    <div className="text-center px-4">
      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-milk-tea-300 to-matcha-300 flex items-center justify-center">
        <span className="text-6xl">🔍</span>
      </div>
      <h2 className="text-xl font-bold text-dark-brown mb-2">发现更多</h2>
      <p className="text-gray-500">探索附近的奶茶店和热门饮品</p>
      <div className="mt-6 p-4 bg-white rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-milk-tea-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📍</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-brown">附近店铺</p>
            <p className="text-sm text-gray-500">正在获取位置信息...</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-matcha-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-brown">热门榜单</p>
            <p className="text-sm text-gray-500">最受欢迎的奶茶排行</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-cream relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/post" element={<PostReviewPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        {window.location.pathname !== '/post' && <BottomNav />}
      </div>
    </Router>
  );
};

export default App;
