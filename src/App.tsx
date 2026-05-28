import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Post from './pages/Post';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';

const AppContent: React.FC = () => {
  const location = useLocation();
  return (
    <div className="w-full min-h-screen bg-cream relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/post" element={<Post />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {location.pathname !== '/post' && <NavBar />}
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
