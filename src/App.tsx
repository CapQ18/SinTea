import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FeedHome from './pages/FeedHome';
import FeedPost from './pages/FeedPost';
import FeedDetail from './pages/FeedDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import NavBar from './components/NavBar';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showNav = ['/', '/discover', '/wishlist', '/profile'].includes(location.pathname);

  return (
    <div className="w-full min-h-screen bg-cream relative">
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
