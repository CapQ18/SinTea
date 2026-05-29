import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FeedHome from './pages/FeedHome';
import FeedPost from './pages/FeedPost';
import FeedDetail from './pages/FeedDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';

const Discover: React.FC = () => (
  <div className="min-h-screen bg-gray-100 pb-20 flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-5xl">
        🔍
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">发现更多</h2>
      <p className="text-gray-500 text-sm">功能开发中，敬请期待...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const showNav = ['/', '/discover', '/wishlist', '/profile'].includes(location.pathname);

  return (
    <div className="w-full min-h-screen bg-gray-100 relative">
      <Routes>
        <Route path="/" element={<FeedHome />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/post" element={<FeedPost />} />
        <Route path="/detail/:id" element={<FeedDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showNav && <NavBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
